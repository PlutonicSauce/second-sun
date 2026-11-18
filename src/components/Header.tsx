import React from 'react';

interface HeaderProps {
  onOpenHowItWorks: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowItWorks,
  onReset,
}) => {
  return (
    <header className="app-header-container">
      {/* Restrained Top Navigation Bar */}
      <div className="top-nav-bar">
        <div className="brand-lockup">
          <div className="brand-dot" aria-hidden="true" />
          <span className="brand-name">SECOND SUN</span>
          <span className="status-pill">SIMULATED DATA · THE HOLLOW 2087</span>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-btn-secondary"
            onClick={onOpenHowItWorks}
            aria-haspopup="dialog"
          >
            About & Science
          </button>
          <button
            type="button"
            className="nav-btn-ghost"
            onClick={onReset}
            title="Reset scenario to default 60% geothermal shortage"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Hero Headline Section */}
      <div className="hero-intro-section">
        <h1 className="hero-headline">Everyone needs light. Not everyone gets it.</h1>
        <p className="hero-subsentence">
          400 meters underground, a geothermal failure forces severe electricity rationing across five subterranean levels.
          Adjust power availability and compare how policies distribute artificial daylight.
        </p>
      </div>
    </header>
  );
};
