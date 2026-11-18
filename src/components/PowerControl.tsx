import React from 'react';

interface PowerControlProps {
  budgetKWh: number;
  baseBudgetKWh: number;
  onBudgetChange: (kwh: number) => void;
  sessionsCount: number;
  residentsCount: number;
}

export const PowerControl: React.FC<PowerControlProps> = ({
  budgetKWh,
  baseBudgetKWh,
  onBudgetChange,
  sessionsCount,
  residentsCount,
}) => {
  const currentPct = baseBudgetKWh > 0 ? Math.round((budgetKWh / baseBudgetKWh) * 100) : 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseInt(e.target.value, 10);
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  const setPct = (pct: number) => {
    const newKWh = parseFloat(((pct / 100) * baseBudgetKWh).toFixed(2));
    onBudgetChange(newKWh);
  };

  return (
    <section className="power-control-section no-print" aria-label="Available Lighting Power Control">
      <div className="power-control-inner">
        <div className="power-header">
          <span className="power-label">Available Lighting Power</span>
          <span className="power-readout">
            <strong className="power-highlight">{currentPct}%</strong>
            <span className="power-muted">({budgetKWh.toFixed(2)} kWh of {baseBudgetKWh.toFixed(2)} kWh)</span>
          </span>
        </div>

        <div className="power-slider-wrap">
          <input
            type="range"
            min={15}
            max={100}
            step={5}
            value={currentPct}
            onChange={handleSlider}
            aria-label="Available Power Percentage"
            className="apple-range-input"
          />
        </div>

        <div className="power-footer">
          <div className="preset-group">
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 100 ? 'preset-active' : ''}`}
              onClick={() => setPct(100)}
            >
              100% Normal
            </button>
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 60 ? 'preset-active' : ''}`}
              onClick={() => setPct(60)}
            >
              60% Shortage
            </button>
            <button
              type="button"
              className={`btn-apple-preset ${currentPct === 25 ? 'preset-active' : ''}`}
              onClick={() => setPct(25)}
            >
              25% Emergency
            </button>
          </div>

          <div className="power-consequence-text">
            {currentPct < 100 ? (
              <span>
                Operating under a <strong>{100 - currentPct}% deficit</strong>. {sessionsCount} sessions scheduled tomorrow for {residentsCount} residents.
              </span>
            ) : (
              <span>Grid at full capacity. All requested daytime sessions scheduled.</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
