import { useState } from 'react';
import type { Scenario, PolicyMode } from './domain/types';
import { multilevel } from './domain/presets';
import { useScheduler } from './hooks/useScheduler';

import { OperatorHeader } from './components/OperatorHeader';
import { IncidentOverview } from './components/IncidentOverview';
import { IncidentControls } from './components/IncidentControls';
import { OperationsPlan } from './components/OperationsPlan';
import { ImpactConsequences } from './components/ImpactConsequences';
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
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

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

  const handleToggleRoom = (roomId: string) => {
    setScenario(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => (r.id === roomId ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  const handleReset = () => {
    setScenario(getDefaultScenario());
    setSelectedCohortId(null);
    setActivePolicy('fair');
  };

  const currentErrors = validationErrors[activePolicy] ?? [];

  return (
    <div className="operator-app-shell">
      {/* Global Operator Navigation & Planning Horizon Header */}
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

        {/* SCREEN 1: The Situation (The Incident Overview) */}
        <IncidentOverview
          scenario={scenario}
          result={activeResult}
          baseBudgetKWh={BASE_BUDGET_KWH}
        />

        {/* SCREEN 3: Adjust the Situation (Real-Time Energy & Room Controls) */}
        <IncidentControls
          budgetKWh={scenario.budgetKWh}
          baseBudgetKWh={BASE_BUDGET_KWH}
          onBudgetChange={handleBudgetChange}
          rooms={scenario.rooms}
          onToggleRoom={handleToggleRoom}
          result={activeResult}
        />

        {/* SCREEN 2: The Recommended Operating Plan (Core Centerpiece) */}
        <OperationsPlan
          scenario={scenario}
          result={activeResult}
          selectedCohortId={selectedCohortId}
          onSelectCohort={setSelectedCohortId}
          onOpenHandover={() => setIsHandoverOpen(true)}
        />

        {/* SCREEN 4: Understand the Consequences (Impact & Unmet Demand Analysis) */}
        <ImpactConsequences
          scenario={scenario}
          result={activeResult}
          selectedCohortId={selectedCohortId}
          onSelectCohort={setSelectedCohortId}
        />
      </main>

      {/* Operator Footer */}
      <footer className="operator-footer">
        <div className="footer-content-inner">
          <div className="footer-left">
            <strong>SECOND SUN</strong> — Facility Operations Planner · Life Underground Track (Patriot HackFest 2026)
          </div>
          <div className="footer-right">
            Deterministic progressive-filling heuristic. Integer watt-minute accounting. Life-safety lighting strictly excluded.
          </div>
        </div>
      </footer>

      {/* SCREEN 5: Put the Plan into Action (Handover & Data Export Modal) */}
      <HandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        scenario={scenario}
        results={results}
        activePolicy={activePolicy}
      />

      {/* SUPPORTING INTELLIGENCE: Why This Schedule? Modal */}
      <WhyThisScheduleModal
        isOpen={isWhyScheduleOpen}
        onClose={() => setIsWhyScheduleOpen(false)}
        scenario={scenario}
        results={results}
        activePolicy={activePolicy}
        onSelectPolicy={setActivePolicy}
      />

      {/* SCIENTIFIC TRANSPARENCY & METHODOLOGY: About & Science Modal */}
      <HowItWorksModal
        isOpen={isAboutScienceOpen}
        onClose={() => setIsAboutScienceOpen(false)}
      />
    </div>
  );
}

export default App;
