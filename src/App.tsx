import { useState } from 'react';
import type { Scenario, PolicyMode } from './domain/types';
import { multilevel } from './domain/presets';
import { useScheduler } from './hooks/useScheduler';
import { downloadScheduleCsv } from './utils/export';

import { OperatorHeader } from './components/OperatorHeader';
import { PowerControl } from './components/PowerControl';
import { RunSheet } from './components/RunSheet';
import { UnmetDemandGuide } from './components/UnmetDemandGuide';
import { HandoverModal } from './components/HandoverModal';
import { WhyThisScheduleModal } from './components/WhyThisScheduleModal';
import { HowItWorksModal } from './components/HowItWorksModal';

import './App.css';

// Base full-capacity budget for the Hollow multi-level regional grid is 3.20 kWh.
const BASE_BUDGET_KWH = 3.20;

function getDefaultScenario(): Scenario {
  const s = multilevel();
  s.budgetKWh = 1.92; // 60% of 3.20 kWh (40% geothermal shortage incident)
  return s;
}

export function App() {
  const [scenario, setScenario] = useState<Scenario>(getDefaultScenario);
  const [activePolicy, setActivePolicy] = useState<PolicyMode>('fair');

  // Modals state
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isWhyScheduleOpen, setIsWhyScheduleOpen] = useState(false);
  const [isAboutScienceOpen, setIsAboutScienceOpen] = useState(false);

  // Live schedule solving across all three policies
  const { results, validationErrors, activeResult } = useScheduler(
    scenario,
    activePolicy,
  );

  const handleBudgetChange = (kwh: number) => {
    setScenario(prev => ({ ...prev, budgetKWh: Math.max(0, kwh) }));
  };

  const handleReset = () => {
    setScenario(getDefaultScenario());
    setActivePolicy('fair');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    downloadScheduleCsv(scenario, activeResult);
  };

  const currentErrors = validationErrors[activePolicy] ?? [];
  const totalResidents = scenario.cohorts.reduce((sum, c) => sum + c.populationPeople, 0);
  const totalSessions = activeResult.assignments.length;
  const currentPct = Math.round((scenario.budgetKWh / BASE_BUDGET_KWH) * 100);

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

        {/* HERO: The Situation & Quick Status Strip */}
        <section className="operator-hero no-print" aria-label="Overview">
          <div className="hero-eyebrow">FACILITY OPERATIONS · SECTOR 4 GEOTHERMAL RATIONING</div>
          <h1 className="hero-title">Tomorrow's Lighting Operations Plan</h1>
          <p className="hero-lede">
            Under Sector 4 geothermal rationing ({currentPct}% capacity), discretionary bright-light rooms are capped at {scenario.budgetKWh.toFixed(2)} kWh. Below is the operational unlock timetable for tomorrow's shifts.
          </p>

          <div className="hero-specs-strip">
            <div className="spec-item">
              <span className="spec-val">{scenario.budgetKWh.toFixed(2)} kWh</span>
              <span className="spec-label">Daily Power Cap ({currentPct}% of {BASE_BUDGET_KWH.toFixed(2)} kWh)</span>
            </div>
            <div className="spec-divider" aria-hidden="true" />
            <div className="spec-item">
              <span className="spec-val">{totalSessions} Sessions</span>
              <span className="spec-label">Scheduled Across 24 Hours ({totalSessions * 30} min total)</span>
            </div>
            <div className="spec-divider" aria-hidden="true" />
            <div className="spec-item">
              <span className="spec-val">{totalResidents} Residents</span>
              <span className="spec-label">Served Across Levels 2 through 8</span>
            </div>
          </div>
        </section>

        {/* POWER CONTROL: Minimalist Interactive Energy Slider */}
        <PowerControl
          budgetKWh={scenario.budgetKWh}
          baseBudgetKWh={BASE_BUDGET_KWH}
          onBudgetChange={handleBudgetChange}
          sessionsCount={totalSessions}
          residentsCount={totalResidents}
        />

        {/* CENTERPIECE: The Timetable / Run Sheet for Tomorrow */}
        <RunSheet
          scenario={scenario}
          result={activeResult}
          onPrint={handlePrint}
          onDownloadCsv={handleDownloadCsv}
        />

        {/* SUPPORT: Unmet Demand Reference for Crew Inquiries */}
        <UnmetDemandGuide
          scenario={scenario}
          result={activeResult}
          onOpenWhyThisSchedule={() => setIsWhyScheduleOpen(true)}
        />
      </main>

      {/* Operator Footer */}
      <footer className="operator-footer no-print">
        <div className="footer-content-inner">
          <div className="footer-left">
            <strong>SECOND SUN</strong> — Facility Operations Planner · The Hollow 2087
          </div>
          <div className="footer-right">
            Deterministic progressive-filling heuristic. Integer watt-minute accounting. Life-safety emergency lighting strictly excluded.
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
        scenario={scenario}
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
