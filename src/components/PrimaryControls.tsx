import React from 'react';
import type { PolicyMode } from '../domain/types';

interface PrimaryControlsProps {
  budgetKWh: number;
  baseBudgetKWh: number;
  onBudgetChange: (kwh: number) => void;
  activePolicy: PolicyMode;
  onSelectPolicy: (policy: PolicyMode) => void;
}

export const PrimaryControls: React.FC<PrimaryControlsProps> = ({
  budgetKWh,
  baseBudgetKWh,
  onBudgetChange,
  activePolicy,
  onSelectPolicy,
}) => {
  // Current percentage of base budget
  const currentPct = baseBudgetKWh > 0 ? Math.round((budgetKWh / baseBudgetKWh) * 100) : 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseInt(e.target.value, 10);
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  const setPresetPct = (pct: number) => {
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  return (
    <div className="primary-controls-container">
      {/* 1. Policy Comparison Segmented Toggle */}
      <div className="control-card policy-selector-card">
        <div className="control-label-row">
          <span className="control-eyebrow">ALLOCATION POLICY</span>
          <span className="control-hint">Compare institutional priority vs fair heuristic</span>
        </div>
        <div className="policy-toggle-group" role="radiogroup" aria-label="Allocation Policy">
          <button
            type="button"
            role="radio"
            aria-checked={activePolicy === 'directorate'}
            className={`policy-toggle-btn ${activePolicy === 'directorate' ? 'policy-active-directorate' : ''}`}
            onClick={() => onSelectPolicy('directorate')}
          >
            <div className="btn-main-label">Directorate Policy</div>
            <div className="btn-sub-label">Upper levels prioritized first</div>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={activePolicy === 'fair'}
            className={`policy-toggle-btn ${activePolicy === 'fair' ? 'policy-active-fair' : ''}`}
            onClick={() => onSelectPolicy('fair')}
          >
            <div className="btn-main-label">SECOND SUN</div>
            <div className="btn-sub-label">Progressive-filling fair share</div>
          </button>
        </div>
      </div>

      {/* 2. Available Power Availability Slider */}
      <div className="control-card power-slider-card">
        <div className="control-label-row">
          <span className="control-eyebrow">AVAILABLE LIGHTING POWER</span>
          <span className="power-readout">
            <strong className="power-pct-value">{currentPct}%</strong>
            <span className="power-kwh-value">({budgetKWh.toFixed(2)} kWh / {baseBudgetKWh.toFixed(2)} kWh)</span>
          </span>
        </div>

        <div className="slider-wrapper">
          <input
            type="range"
            min={15}
            max={100}
            step={5}
            value={currentPct}
            onChange={handleSliderChange}
            aria-label="Available Lighting Power Percentage"
            className="power-range-input"
          />
        </div>

        <div className="preset-buttons-row">
          <button
            type="button"
            className={`preset-pill ${currentPct === 100 ? 'preset-pill-active' : ''}`}
            onClick={() => setPresetPct(100)}
          >
            100% Normal
          </button>
          <button
            type="button"
            className={`preset-pill ${currentPct === 60 ? 'preset-pill-active' : ''}`}
            onClick={() => setPresetPct(60)}
          >
            60% Geothermal Shortage
          </button>
          <button
            type="button"
            className={`preset-pill ${currentPct === 25 ? 'preset-pill-active' : ''}`}
            onClick={() => setPresetPct(25)}
          >
            25% Critical Crisis
          </button>
        </div>
      </div>
    </div>
  );
};
