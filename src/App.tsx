import { useState } from 'react';
import type { Scenario, PolicyMode } from './domain/types';
import { multilevel } from './domain/presets';
import { useScheduler } from './hooks/useScheduler';

import { Header } from './components/Header';
import { PrimaryControls } from './components/PrimaryControls';
import { HollowLevelsView } from './components/HollowLevelsView';
import { OutcomeSummary } from './components/OutcomeSummary';
import { SystemInspector } from './components/SystemInspector';
import { HowItWorksModal } from './components/HowItWorksModal';

import './App.css';

// Base budget for the multi-level scenario is 3.2 kWh.
// Default launch simulates a 60% geothermal power shortage (1.92 kWh).
const BASE_BUDGET_KWH = 3.2;

function getDefaultScenario(): Scenario {
  const s = multilevel();
  s.budgetKWh = 1.92; // 60% of 3.2 kWh
  return s;
}

export function App() {
  const [scenario, setScenario] = useState<Scenario>(getDefaultScenario);
  const [activePolicy, setActivePolicy] = useState<PolicyMode>('fair');
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Live schedule solving across all three policies
  const { results, validationErrors, preferredCov, activeResult } = useScheduler(
    scenario,
    activePolicy,
  );

  const handleBudgetChange = (kwh: number) => {
    setScenario(prev => ({ ...prev, budgetKWh: Math.max(0, kwh) }));
  };

  const handlePeakChange = (w: number) => {
    setScenario(prev => ({ ...prev, peakW: Math.max(100, w) }));
  };

  const handleScenarioSelect = (newScenario: Scenario) => {
    setScenario(newScenario);
    setSelectedCohortId(null);
  };

  const handleReset = () => {
    setScenario(getDefaultScenario());
    setSelectedCohortId(null);
    setActivePolicy('fair');
  };

  const handleCohortRequestChange = (cohortId: string, req: number) => {
    setScenario(prev => ({
      ...prev,
      cohorts: prev.cohorts.map(c => (c.id === cohortId ? { ...c, requestedSlots: req } : c)),
    }));
  };

  const handleToggleRoom = (roomId: string) => {
    setScenario(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => (r.id === roomId ? { ...r, enabled: !r.enabled } : r)),
    }));
  };

  return (
    <div className="app-shell">
      {/* SECTION A: Minimal Introduction */}
      <Header
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onReset={handleReset}
      />

      <main className="main-container">
        {/* SECTION C: One Primary Control (Policy Toggle & Power Slider) */}
        <PrimaryControls
          budgetKWh={scenario.budgetKWh}
          baseBudgetKWh={BASE_BUDGET_KWH}
          onBudgetChange={handleBudgetChange}
          activePolicy={activePolicy}
          onSelectPolicy={setActivePolicy}
        />

        {/* SECTION B: Interactive Visualization of the Hollow (Visual Centerpiece) */}
        <HollowLevelsView
          scenario={scenario}
          result={activeResult}
          activePolicy={activePolicy}
          preferredCov={preferredCov[activePolicy]}
          selectedCohortId={selectedCohortId}
          onSelectCohort={setSelectedCohortId}
        />

        {/* SECTION D: Clear Human-Centered Outcome */}
        <OutcomeSummary
          scenario={scenario}
          result={activeResult}
          activePolicy={activePolicy}
        />

        {/* STEP 3: Progressive Disclosure — System Inspector & Deep Details */}
        <SystemInspector
          scenario={scenario}
          results={results}
          activePolicy={activePolicy}
          onSelectPolicy={setActivePolicy}
          preferredCov={preferredCov}
          selectedCohortId={selectedCohortId}
          onSelectCohort={setSelectedCohortId}
          onBudgetChange={handleBudgetChange}
          onPeakChange={handlePeakChange}
          onSelectScenario={handleScenarioSelect}
          onToggleRoom={handleToggleRoom}
          onCohortRequestChange={handleCohortRequestChange}
          validationErrors={validationErrors}
        />
      </main>

      {/* Restrained, Minimal Footer */}
      <footer className="app-footer-minimal">
        <div className="footer-inner">
          <span>
            SECOND SUN · Patriot HackFest Fall 2026 · Life Underground Track
          </span>
          <span className="footer-disclaimer-short">
            Deterministic progressive-filling heuristic under strict integer power constraints. Life-safety lighting excluded.
          </span>
        </div>
      </footer>

      {/* Science & Methodology Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}

export default App;
