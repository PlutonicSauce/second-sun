import React, { useState } from 'react';
import type { Scenario, ScheduleResult, PolicyMode } from '../domain/types';
import { Timeline } from './Timeline';
import { PolicyComparison } from './PolicyComparison';
import { RoomList } from './RoomList';
import { ScenarioPicker } from './ScenarioPicker';
import { CohortList } from './CohortList';
import { BudgetControl } from './BudgetControl';
import { exportScenarioJson, exportScheduleCsv } from '../utils/export';

interface SystemInspectorProps {
  scenario: Scenario;
  results: Record<PolicyMode, ScheduleResult>;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
  preferredCov: Record<PolicyMode, Record<string, number>>;
  selectedCohortId: string | null;
  onSelectCohort: (cohortId: string | null) => void;
  onBudgetChange: (kwh: number) => void;
  onPeakChange: (w: number) => void;
  onSelectScenario: (scenario: Scenario) => void;
  onToggleRoom: (roomId: string) => void;
  onCohortRequestChange: (cohortId: string, req: number) => void;
  validationErrors: Record<PolicyMode, string[]>;
}

export const SystemInspector: React.FC<SystemInspectorProps> = ({
  scenario,
  results,
  activePolicy,
  onSelectPolicy,
  preferredCov,
  selectedCohortId,
  onSelectCohort,
  onBudgetChange,
  onPeakChange,
  onSelectScenario,
  onToggleRoom,
  onCohortRequestChange,
  validationErrors,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'comparison' | 'controls' | 'export'>('timeline');

  const activeResult = results[activePolicy];
  const currentErrors = validationErrors[activePolicy] ?? [];

  return (
    <section className="system-inspector-container" aria-label="System Inspector and Advanced Details">
      {/* Accordion Toggle Bar */}
      <button
        type="button"
        className="inspector-toggle-bar"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="toggle-bar-left">
          <span className={`toggle-icon ${isOpen ? 'toggle-icon-open' : ''}`}>▾</span>
          <div>
            <span className="toggle-title">System Inspector & Deep Verification</span>
            <span className="toggle-desc">
              Inspect 48-slot room timelines, 3-way policy benchmarks, electrical constraints, and data exports.
            </span>
          </div>
        </div>
        <div className="toggle-bar-right">
          <span className="inspector-pill">
            {isOpen ? 'Collapse Details' : 'View Deep Technical Controls'}
          </span>
        </div>
      </button>

      {/* Expanded Content Drawer */}
      {isOpen && (
        <div className="inspector-expanded-body">
          {/* Sub-Tabs */}
          <div className="inspector-tabs-nav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'timeline'}
              className={`inspector-tab-btn ${activeTab === 'timeline' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              24-Hour Room Timeline
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'comparison'}
              className={`inspector-tab-btn ${activeTab === 'comparison' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              3-Way Policy Benchmark
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'controls'}
              className={`inspector-tab-btn ${activeTab === 'controls' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('controls')}
            >
              Rooms & Scenario Presets
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'export'}
              className={`inspector-tab-btn ${activeTab === 'export' ? 'tab-btn-active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              Export & Verification
            </button>
          </div>

          {/* Validation Warnings */}
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

          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="inspector-tab-content">
              <Timeline
                scenario={scenario}
                result={activeResult}
                selectedCohortId={selectedCohortId}
                onSelectCohort={onSelectCohort}
              />
            </div>
          )}

          {/* Tab 2: Policy Comparison */}
          {activeTab === 'comparison' && (
            <div className="inspector-tab-content">
              <PolicyComparison
                scenario={scenario}
                results={results}
                activePolicy={activePolicy}
                onSelectPolicy={onSelectPolicy}
              />
            </div>
          )}

          {/* Tab 3: Detailed Controls */}
          {activeTab === 'controls' && (
            <div className="inspector-tab-content inspector-controls-grid">
              <div className="controls-subcolumn">
                <ScenarioPicker
                  currentScenarioId={scenario.id}
                  onSelectScenario={onSelectScenario}
                />
                <BudgetControl
                  budgetKWh={scenario.budgetKWh}
                  peakW={scenario.peakW}
                  onBudgetChange={onBudgetChange}
                  onPeakChange={onPeakChange}
                />
                <RoomList rooms={scenario.rooms} onToggleRoom={onToggleRoom} />
              </div>
              <div className="controls-subcolumn">
                <CohortList
                  cohorts={scenario.cohorts}
                  result={activeResult}
                  preferredCov={preferredCov[activePolicy]}
                  selectedCohortId={selectedCohortId}
                  onSelectCohort={onSelectCohort}
                  onRequestChange={onCohortRequestChange}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Export & System Assurances */}
          {activeTab === 'export' && (
            <div className="inspector-tab-content export-tab-content">
              <div className="export-cards-grid">
                <div className="export-action-card">
                  <h4>Structured JSON Export</h4>
                  <p>Download complete scenario inputs, solver assignments, and metrics across all three policies.</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportScenarioJson(scenario, results)}
                  >
                    Download Scenario JSON
                  </button>
                </div>

                <div className="export-action-card">
                  <h4>Tabular CSV Export</h4>
                  <p>Download tidy schedule table (slot, room, cohort, watts, window status) for spreadsheet analysis.</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => exportScheduleCsv(scenario, results)}
                  >
                    Download Schedule CSV
                  </button>
                </div>
              </div>

              <div className="system-assurances-panel">
                <h4>System Integrity & Physical Guarantees</h4>
                <ul>
                  <li>✓ <strong>Integer Watt-Minute Accounting:</strong> Energy accounted as <code>wm = watts × 30</code>. Zero floating-point drift.</li>
                  <li>✓ <strong>48 Half-Hour Slots:</strong> Supports overnight shifts and safe modular arithmetic across midnight (<code>47 → 0</code>).</li>
                  <li>✓ <strong>Safety Isolation:</strong> Emergency, life-support, and corridor egress lighting are hard-isolated from the discretionary budget.</li>
                  <li>✓ <strong>Independent Verification:</strong> 11 physical constraints verified automatically on every recalculation.</li>
                  <li>✓ <strong>Heuristic Honesty:</strong> SECOND SUN is a deterministic progressive-filling max-min heuristic, not a globally optimal solver.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
