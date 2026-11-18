import React from 'react';

interface OperatorHeaderProps {
  onOpenWhyThisSchedule: () => void;
  onOpenAboutScience: () => void;
  onOpenHandover: () => void;
  onReset: () => void;
}

export const OperatorHeader: React.FC<OperatorHeaderProps> = ({
  onOpenWhyThisSchedule,
  onOpenAboutScience,
  onOpenHandover,
  onReset,
}) => {
  return (
    <header className="operator-header">
      <div className="header-inner">
        {/* Brand & System Lockup */}
        <div className="brand-group">
          <div className="brand-dot" aria-hidden="true" />
          <div className="brand-text">
            <span className="brand-title">SECOND SUN</span>
            <span className="brand-subtitle">FACILITY PLANNING SYSTEM · THE HOLLOW 2087</span>
          </div>
        </div>

        {/* 24-Hour Horizon Pill */}
        <div className="horizon-indicator" title="24-Hour Planning Cycle">
          <span className="horizon-pulse" />
          <span className="horizon-text">CYCLE 2087-D42 · 24-HOUR PLANNING HORIZON</span>
        </div>

        {/* Global Operational Actions */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-header-ghost"
            onClick={onOpenWhyThisSchedule}
            title="Inspect why this schedule was selected over institutional baselines"
          >
            Why This Schedule?
          </button>

          <button
            type="button"
            className="btn-header-ghost"
            onClick={onOpenAboutScience}
            title="Review scientific constraints, citations, and non-clinical disclosures"
          >
            About & Science
          </button>

          <button
            type="button"
            className="btn-header-primary"
            onClick={onOpenHandover}
            title="Export actionable shift handover brief, CSV, and JSON"
          >
            Export Plan
          </button>

          <button
            type="button"
            className="btn-header-reset"
            onClick={onReset}
            title="Reset to default 60% shortage scenario"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
};
