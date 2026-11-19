import type { EmergencyScheduleDelta } from '../domain/runsheet';

interface EmergencyDeltaBannerProps {
  delta: EmergencyScheduleDelta;
  normalBudgetKWh: number;
  emergencyBudgetKWh: number;
  onRestore: () => void;
  onAcknowledge: () => void;
}

export function EmergencyDeltaBanner({
  delta,
  normalBudgetKWh,
  emergencyBudgetKWh,
  onRestore,
  onAcknowledge,
}: EmergencyDeltaBannerProps) {
  return (
    <section className="emergency-delta-banner no-print" aria-labelledby="emergency-title">
      <div className="emergency-banner-top">
        <div className="emergency-banner-title-group">
          <h3 className="emergency-title" id="emergency-title">What changes during generator failure?</h3>
          <p className="emergency-subtitle">
            Lighting budget: {normalBudgetKWh.toFixed(2)} → {emergencyBudgetKWh.toFixed(2)} kWh.
            Both plans use the selected policy and room settings.
          </p>
        </div>
        <div className="emergency-banner-actions">
          <button type="button" className="btn-apple-secondary" onClick={onAcknowledge}>Hide changes</button>
          <button type="button" className="btn-emergency-restore" onClick={onRestore}>Restore baseline budget</button>
        </div>
      </div>

      <div className="emergency-stats-strip">
        <div className="emergency-stat-item">
          <span className="stat-delta">{delta.previousSessions} → {delta.newSessions}</span>
          <span className="stat-label">Half-hour sessions</span>
        </div>
        <div className="emergency-stat-item">
          <span className="stat-delta">{delta.previousKWh.toFixed(2)} → {delta.newKWh.toFixed(2)} kWh</span>
          <span className="stat-label">Energy used by the schedule</span>
        </div>
      </div>

      {delta.cohortDeltas.length === 0 ? (
        <p className="emergency-subtitle">Every crew keeps its session count at this budget.</p>
      ) : (
        <div className="breakdown-grid">
          {delta.cohortDeltas.map(change => (
            <div key={change.cohortId} className="breakdown-card">
              <span className="breakdown-crew-name">Level {change.cohortLevel} · {change.cohortName}</span>
              <div className="breakdown-card-bottom">
                <span className="breakdown-change">{change.previousSessions} → {change.newSessions} sessions</span>
                {change.isBlackedOut && <span className="badge-blackout">Loses all room time</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
