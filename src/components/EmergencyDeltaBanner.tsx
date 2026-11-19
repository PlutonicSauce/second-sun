import React from 'react';
import type { EmergencyScheduleDelta } from '../domain/runsheet';

interface EmergencyDeltaBannerProps {
  delta: EmergencyScheduleDelta;
  onRestore: () => void;
  onAcknowledge: () => void;
}

export const EmergencyDeltaBanner: React.FC<EmergencyDeltaBannerProps> = ({
  delta,
  onRestore,
  onAcknowledge,
}) => {
  return (
    <section className="emergency-delta-banner no-print" role="alert" aria-live="assertive" aria-label="Generator Failure Incident Delta">
      <div className="emergency-banner-top">
        <div className="emergency-banner-title-group">
          <div className="emergency-tag-row">
            <span className="emergency-pulse" />
            <span className="emergency-tag">GRID CONTINGENCY ACTIVE · GEOTHERMAL GENERATOR TRIP</span>
          </div>
          <h2 className="emergency-title">Generator Failure Simulation Active</h2>
          <p className="emergency-subtitle">
            Discretionary lighting power dropped from {delta.previousKWh.toFixed(2)} kWh to {delta.newKWh.toFixed(2)} kWh. Below is the real-time operational impact calculated by the scheduling engine.
          </p>
        </div>

        <div className="emergency-banner-actions">
          <button type="button" className="btn-apple-secondary" onClick={onAcknowledge}>
            Acknowledge Emergency Plan
          </button>
          <button type="button" className="btn-emergency-restore" onClick={onRestore}>
            ↺ Restore Previous Schedule
          </button>
        </div>
      </div>

      {/* High-Level Impact Telemetry Strip */}
      <div className="emergency-stats-strip">
        <div className="emergency-stat-item">
          <span className="stat-delta text-danger">-{delta.lostSessions} Sessions</span>
          <span className="stat-label">Cancelled Tomorrow ({delta.lostSessions * 30} min total)</span>
        </div>
        <div className="stat-divider" aria-hidden="true" />
        <div className="emergency-stat-item">
          <span className="stat-delta text-danger">-{delta.lostPersonSessions} Person-Sessions</span>
          <span className="stat-label">Reduced Resident Access</span>
        </div>
        <div className="stat-divider" aria-hidden="true" />
        <div className="emergency-stat-item">
          <span className="stat-delta text-danger">-{delta.lostKWh.toFixed(2)} kWh</span>
          <span className="stat-label">Power Load Shed</span>
        </div>
      </div>

      {/* Cohort-Level Impact Breakdown */}
      <div className="emergency-cohorts-breakdown">
        <span className="breakdown-heading">Impact on Subterranean Sectors:</span>
        <div className="breakdown-grid">
          {delta.cohortDeltas.map(cd => (
            <div
              key={cd.cohortId}
              className={`breakdown-card ${cd.isBlackedOut ? 'card-blackout' : 'card-reduced'}`}
            >
              <div className="breakdown-card-top">
                <span className="breakdown-crew-name">{cd.cohortName}</span>
                <span className="breakdown-crew-level">Level {cd.cohortLevel} · {cd.cohortPopulation} crew</span>
              </div>
              <div className="breakdown-card-bottom">
                <span className="breakdown-change">
                  {cd.previousSessions} → {cd.newSessions} sessions ({cd.sessionsDelta})
                </span>
                {cd.isBlackedOut && (
                  <span className="badge-blackout">Completely Blacked Out</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
