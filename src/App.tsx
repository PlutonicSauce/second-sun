import { useMemo, useState } from 'react';
import type { Scenario, PolicyMode } from './domain/types';
import { solve } from './domain/engine';
import { multilevel } from './domain/presets';
import { useScheduler } from './hooks/useScheduler';
import { exportScheduleCsv } from './utils/export';
import {
  calculateOperationalMetrics,
  computeEmergencyScheduleDelta,
} from './domain/runsheet';

import { OperatorHeader } from './components/OperatorHeader';
import { SubterraneanVisualizer } from './components/SubterraneanVisualizer';
import { FacilityRoomsControl } from './components/FacilityRoomsControl';
import { EmergencyDeltaBanner } from './components/EmergencyDeltaBanner';
import { RunSheet } from './components/RunSheet';
import { UnmetDemandGuide } from './components/UnmetDemandGuide';
import { HandoverModal } from './components/HandoverModal';
import { WhyThisScheduleModal } from './components/WhyThisScheduleModal';
import { HowItWorksModal } from './components/HowItWorksModal';

import './App.css';

// Base full-capacity budget for the Hollow multi-level regional grid is 3.20 kWh.
const BASE_BUDGET_KWH = 3.20;
const EMERGENCY_BUDGET_KWH = BASE_BUDGET_KWH / 4;

function getDefaultScenario(): Scenario {
  const s = multilevel();
  s.budgetKWh = 1.92; // 60% of 3.20 kWh (40% geothermal shortage incident)
  return s;
}

export function App() {
  const [normalScenario, setScenario] = useState<Scenario>(getDefaultScenario);
  const [activePolicy, setActivePolicy] = useState<PolicyMode>('fair');

  // Modals state
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isWhyScheduleOpen, setIsWhyScheduleOpen] = useState(false);
  const [isAboutScienceOpen, setIsAboutScienceOpen] = useState(false);

  const [generatorFailed, setGeneratorFailed] = useState(false);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(true);
  const scenario = useMemo(() => generatorFailed
    ? { ...normalScenario, budgetKWh: Math.min(normalScenario.budgetKWh, EMERGENCY_BUDGET_KWH) }
    : normalScenario, [generatorFailed, normalScenario]);

  const { results, validationErrors, activeResult } = useScheduler(scenario, activePolicy);
  const emergencyDelta = useMemo(() => generatorFailed && showEmergencyDetails
    ? computeEmergencyScheduleDelta(scenario, solve(normalScenario, activePolicy), activeResult)
    : null, [generatorFailed, showEmergencyDetails, scenario, normalScenario, activePolicy, activeResult]);

  const handleBudgetChange = (kwh: number) => {
    setScenario(prev => ({ ...prev, budgetKWh: Math.max(0, kwh) }));
  };

  const handleToggleRoom = (roomId: string) => {
    setScenario(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => (r.id === roomId ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  const handleSimulateGeneratorFailure = () => {
    setGeneratorFailed(true);
    setShowEmergencyDetails(true);
  };

  const handleRestoreEmergency = () => setGeneratorFailed(false);

  const handleReset = () => {
    setScenario(getDefaultScenario());
    setActivePolicy('fair');
    setGeneratorFailed(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    exportScheduleCsv(scenario, activeResult, activePolicy);
  };

  // Accurate operational metrics calculation
  const opMetrics = calculateOperationalMetrics(scenario, activeResult);
  const currentErrors = validationErrors[activePolicy] ?? [];
  const currentPct = Math.round((scenario.budgetKWh / BASE_BUDGET_KWH) * 100);

  const activeRoomIds = new Set(activeResult.assignments.map(a => a.roomId));

  return (
    <div className="operator-app-shell">
      {/* Global Operator Navigation Header */}
      <OperatorHeader
        onOpenWhyThisSchedule={() => setIsWhyScheduleOpen(true)}
        onOpenAboutScience={() => setIsAboutScienceOpen(true)}
        onOpenHandover={() => setIsHandoverOpen(true)}
        onReset={handleReset}
      />

      <main className="operator-main-content">
        {/* Constraint Violations Alert (if any physical bounds broken) */}
        {currentErrors.length > 0 && (
          <div className="validation-alert" role="alert">
            <strong>Physical Constraint Violations Detected:</strong>
            <ul>
              {currentErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* HERO: The Situation & Corrected Metrics Strip */}
        <section className="operator-hero no-print" aria-label="Overview">
          <div className="hero-eyebrow">THE HOLLOW · FICTIONAL SCENARIO</div>
          <h1 className="hero-title">Schedule bright-light access underground</h1>
          <p className="hero-lede">
            Residents in the Hollow live without sunlight. Geothermal rationing limits how often crews across {opMetrics.levelSpanText} can use shared bright-light rooms. Compare who gets time, then export tomorrow’s schedule.
          </p>

          <div className="hero-specs-strip">
            <div className="spec-item">
              <span className="spec-val">{currentPct}%</span>
              <span className="spec-label">of the usual lighting budget ({scenario.budgetKWh.toFixed(2)} kWh)</span>
            </div>
            <div className="spec-divider" aria-hidden="true" />
            <div className="spec-item">
              <span className="spec-val">{opMetrics.totalSessions} of {opMetrics.totalSessions + activeResult.metrics.unmet}</span>
              <span className="spec-label">half-hour sessions booked · {activeResult.metrics.unmet} unmet</span>
            </div>
            <div className="spec-divider" aria-hidden="true" />
            <div className="spec-item">
              <span className="spec-val">
                {opMetrics.residentsServed} of {opMetrics.residentsAffected}
              </span>
              <span className="spec-label">residents with at least one session</span>
            </div>
          </div>
        </section>

        {/* THE CENTERPIECE: Subterranean Daylight Allocation Studio & Policy Comparison */}
        <SubterraneanVisualizer
          scenario={scenario}
          activeResult={activeResult}
          results={results}
          activePolicy={activePolicy}
          onSelectPolicy={setActivePolicy}
          normalBudgetKWh={normalScenario.budgetKWh}
          baseBudgetKWh={BASE_BUDGET_KWH}
          onBudgetChange={handleBudgetChange}
          onSimulateGeneratorFailure={handleSimulateGeneratorFailure}
          isEmergencySimulated={generatorFailed}
          onRestoreGenerator={handleRestoreEmergency}
          onShowEmergencyDetails={() => setShowEmergencyDetails(true)}
          emergencyDetails={emergencyDelta && (
            <EmergencyDeltaBanner
              delta={emergencyDelta}
              onRestore={handleRestoreEmergency}
              onAcknowledge={() => setShowEmergencyDetails(false)}
              normalBudgetKWh={normalScenario.budgetKWh}
              emergencyBudgetKWh={scenario.budgetKWh}
            />
          )}
        />

        {/* OPERATIONAL EDITING: Room Availability & Maintenance Toggles */}
        <FacilityRoomsControl
          rooms={scenario.rooms}
          onToggleRoom={handleToggleRoom}
          activeRoomIds={activeRoomIds}
        />

        {/* CENTERPIECE: The Timetable / Run Sheet for Tomorrow */}
        <RunSheet
          scenario={scenario}
          result={activeResult}
          activePolicy={activePolicy}
          onPrint={handlePrint}
          onDownloadCsv={handleDownloadCsv}
          onOpenHandover={() => setIsHandoverOpen(true)}
        />

        {/* SUPPORT: Unmet Demand Reference for Crew Inquiries */}
        <UnmetDemandGuide
          scenario={scenario}
          result={activeResult}
        />
      </main>

      {/* Operator Footer */}
      <footer className="operator-footer no-print">
        <div className="footer-content-inner">
          <div className="footer-left">
            <strong>SECOND SUN</strong> — Facility Operations Planner · The Hollow 2087
          </div>
          <div className="footer-right">
            Emergency, exit and essential task lighting are outside this plan.
          </div>
        </div>
      </footer>

      {/* MODAL 1: Export Handover Plan (CSV, JSON, Shift Brief) */}
      <HandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        scenario={scenario}
        results={results}
        activePolicy={activePolicy}
      />

      {/* MODAL 2: Why This Schedule? (Compare with Directorate & First-Come) */}
      <WhyThisScheduleModal
        isOpen={isWhyScheduleOpen}
        onClose={() => setIsWhyScheduleOpen(false)}
        results={results}
        activePolicy={activePolicy}
        onSelectPolicy={setActivePolicy}
      />

      {/* MODAL 3: About & Science (Disclosures, Biology, Methodology) */}
      <HowItWorksModal
        isOpen={isAboutScienceOpen}
        onClose={() => setIsAboutScienceOpen(false)}
      />
    </div>
  );
}

export default App;
