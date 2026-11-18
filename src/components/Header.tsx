import React from 'react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onReset: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onReset,
  onExportJson,
  onExportCsv,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <circle cx="16" cy="16" r="7" fill="#f59e0b" />
            <path
              d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M2 28h28" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">SECOND SUN</h1>
            <span className="badge badge-simulated">SIMULATED DATA</span>
            <span className="badge badge-hollow">HOLLOW LEVEL 9</span>
          </div>
          <p className="brand-subline">
            Plan shared bright-light access for residents on different shifts under a strict power budget.
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenHowItWorks}
          aria-haspopup="dialog"
        >
          <span className="btn-icon">ℹ️</span> How It Works
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onExportJson}
          title="Export schedule and scenario as JSON"
        >
          Export JSON
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onExportCsv}
          title="Export assignments table as CSV"
        >
          Export CSV
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onReset}
          title="Reset to 60% shortage preset"
        >
          ↺ Reset
        </button>
      </div>
    </header>
  );
};
