import React from 'react';
import { hollow, rationing, toy, multilevel } from '../domain/presets';
import type { Scenario } from '../domain/types';

interface ScenarioPickerProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  currentScenarioId,
  onSelectScenario,
}) => {
  const options = [
    {
      id: 'hollow',
      name: 'Hollow Level 9 (Rotating Shifts)',
      desc: '4 cohorts across levels 3, 5, 7, 9. Default 2.28 kWh (60%) geothermal shortage.',
      factory: () => {
        const s = hollow();
        s.budgetKWh = 2.28; // default to 60% shortage
        return s;
      },
    },
    {
      id: 'multilevel',
      name: 'Hollow Multi-Sector Grid (Levels 2–9)',
      desc: '5 cohorts from Level 2 Executive to Level 9 Deep Sump. Shows Directorate upper-level favoritism.',
      factory: () => {
        const s = multilevel();
        s.budgetKWh = 1.92; // 60% of 3.2 kWh
        return s;
      },
    },
    {
      id: 'rationing',
      name: 'Emergency Rationing (Atrium Offline)',
      desc: '1.20 kWh budget, 600 W peak, Atrium offline. Severe resource competition.',
      factory: rationing,
    },
    {
      id: 'toy',
      name: 'Toy Fairness Verification',
      desc: 'Single room, 2 groups with identical requests. Demonstrates fair vs first-come split.',
      factory: toy,
    },
  ];

  return (
    <div className="control-card">
      <div className="card-header">
        <h3 className="card-title">Select Scenario</h3>
      </div>
      <div className="scenario-options" role="radiogroup" aria-label="Scenario options">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={currentScenarioId === opt.id}
            className={`scenario-card ${currentScenarioId === opt.id ? 'active' : ''}`}
            onClick={() => onSelectScenario(opt.factory())}
          >
            <div className="scenario-card-header">
              <span className="scenario-name">{opt.name}</span>
              {currentScenarioId === opt.id && <span className="scenario-check">✓ Active</span>}
            </div>
            <p className="scenario-desc">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
