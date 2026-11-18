import { useState } from 'react';
import type { Scenario, PolicyMode } from './domain/types';
import { hollow } from './domain/presets';
import { useScheduler } from './hooks/useScheduler';
import { exportScenarioJson, exportScheduleCsv } from './utils/export';

import { Header } from './components/Header';
import { CrisisBanner } from './components/CrisisBanner';
import { KeyMetrics } from './components/KeyMetrics';
import { BudgetControl } from './components/BudgetControl';
import { ScenarioPicker } from './components/ScenarioPicker';
import { Timeline } from './components/Timeline';
import { CohortList } from './components/CohortList';
import { RoomList } from './components/RoomList';
import { PolicyComparison } from './components/PolicyComparison';
import { HowItWorksModal } from './components/HowItWorksModal';

import './App.css';

function getDefaultScenario(): Scenario {
  const s = hollow();
  s.budgetKWh = 2.28; // Default 60% shortage scenario (2.28 kWh of 3.8 kWh)
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

  const currentErrors = validationErrors[activePolicy] ?? [];

  return (
    <div className="app-layout">
      <Header
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onReset={handleReset}
        onExportJson={() => exportScenarioJson(scenario, results)}
        onExportCsv={() => exportScheduleCsv(scenario, results)}
      />

      <main className="main-content">
        <CrisisBanner scenario={scenario} result={activeResult} />

        {currentErrors.length > 0 && (
          <div className="validation-alert" role="alert">
            <strong>Constraint Violations Detected:</strong>
            <ul>
              {currentErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <KeyMetrics metrics={activeResult.metrics} scenario={scenario} />

        <div className="operations-workspace">
          {/* Left Column: Controls & Configuration */}
          <div className="controls-column">
            <BudgetControl
              budgetKWh={scenario.budgetKWh}
              peakW={scenario.peakW}
              onBudgetChange={handleBudgetChange}
              onPeakChange={handlePeakChange}
            />

            <ScenarioPicker
              currentScenarioId={scenario.id}
              onSelectScenario={handleScenarioSelect}
            />

            <RoomList rooms={scenario.rooms} onToggleRoom={handleToggleRoom} />

            <CohortList
              cohorts={scenario.cohorts}
              result={activeResult}
              preferredCov={preferredCov[activePolicy]}
              selectedCohortId={selectedCohortId}
              onSelectCohort={setSelectedCohortId}
              onRequestChange={handleCohortRequestChange}
            />
          </div>

          {/* Right Column: Visualization & Policy Analysis */}
          <div className="visualization-column">
            <Timeline
              scenario={scenario}
              result={activeResult}
              selectedCohortId={selectedCohortId}
              onSelectCohort={setSelectedCohortId}
            />

            <PolicyComparison
              results={results}
              activePolicy={activePolicy}
              onSelectPolicy={setActivePolicy}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>SECOND SUN</strong> — Patriot HackFest Fall 2026 Submission. Life Underground track
            (Challenges #2: Unfair Electricity Allocations & #11: Life Without Sunlight).
          </p>
          <p className="footer-disclaimer">
            Simulated scenario. Deterministic progressive-filling heuristic. No clinical outcomes,
            circadian dose formulas, or health predictions claimed. Life-safety and exit lighting are
            untouchable and separated.
          </p>
        </div>
      </footer>

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}

export default App;
