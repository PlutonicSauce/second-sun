import React from 'react';

interface BudgetControlProps {
  budgetKWh: number;
  peakW: number;
  onBudgetChange: (val: number) => void;
  onPeakChange: (val: number) => void;
}

export const BudgetControl: React.FC<BudgetControlProps> = ({
  budgetKWh,
  peakW,
  onBudgetChange,
  onPeakChange,
}) => {
  const presets = [
    { label: 'Full Grid (100%)', kwh: 3.8, desc: '3.80 kWh baseline' },
    { label: 'Level 9 Shortage (60%)', kwh: 2.28, desc: '2.28 kWh default crisis' },
    { label: 'Severe Rationing (25%)', kwh: 0.95, desc: '0.95 kWh emergency' },
  ];

  return (
    <div className="control-card">
      <div className="card-header">
        <h3 className="card-title">Discretionary Power Budget</h3>
        <span className="badge badge-amber">{budgetKWh.toFixed(2)} kWh / Day</span>
      </div>

      <div className="control-group">
        <div className="control-label-row">
          <label htmlFor="budget-slider" className="control-label">
            Daily Discretionary Energy
          </label>
          <div className="control-input-wrap">
            <input
              id="budget-input"
              type="number"
              min="0"
              max="10"
              step="0.05"
              value={budgetKWh}
              onChange={e => onBudgetChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="number-input"
              aria-label="Daily discretionary energy in kilowatt-hours"
            />
            <span className="input-unit">kWh</span>
          </div>
        </div>

        <input
          id="budget-slider"
          type="range"
          min="0"
          max="5"
          step="0.05"
          value={budgetKWh}
          onChange={e => onBudgetChange(parseFloat(e.target.value))}
          className="range-slider"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={budgetKWh}
        />

        <div className="preset-buttons" role="group" aria-label="Energy presets">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              className={`btn-preset ${Math.abs(budgetKWh - p.kwh) < 0.05 ? 'active' : ''}`}
              onClick={() => onBudgetChange(p.kwh)}
              title={p.desc}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label-row">
          <label htmlFor="peak-input" className="control-label">
            Peak Power Cap (Simultaneous Rooms)
          </label>
          <div className="control-input-wrap">
            <input
              id="peak-input"
              type="number"
              min="100"
              max="3000"
              step="50"
              value={peakW}
              onChange={e => onPeakChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="number-input"
              aria-label="Peak power cap in watts"
            />
            <span className="input-unit">W</span>
          </div>
        </div>
      </div>

      <div className="safety-callout">
        <div className="callout-icon" aria-hidden="true">🛡️</div>
        <p className="callout-text">
          <strong>Life-Safety Isolation:</strong> Emergency exit routes, task-critical monitors, and
          corridor illumination operate on independent hard-wired safety circuits. They are strictly
          excluded from this discretionary room-lighting budget.
        </p>
      </div>
    </div>
  );
};
