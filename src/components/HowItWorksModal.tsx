import React from 'react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              How SECOND SUN Works — Architectural & Scientific Transparency
            </h2>
            <p className="modal-subtitle">
              Fairness-aware, resource-constrained scheduling under subterranean energy rationing.
            </p>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1 */}
          <section className="modal-section">
            <h3 className="section-title">1. The Core Dilemma in the Hollow</h3>
            <p>
              In the subterranean habitat of Level 9, residents live and work without natural sunlight.
              Access to communal bright-light rooms is vital for circadian entrainment, alertness, and
              morale. However, electricity is strictly rationed due to geothermal supply constraints.
              When total requested light exceeds available kilowatt-hours, arbitrary or first-come
              allocations cause entire shift groups (especially off-shift or smaller cohorts) to receive
              zero access.
            </p>
          </section>

          {/* Section 2 */}
          <section className="modal-section">
            <h3 className="section-title">2. Algorithm: Greedy Progressive-Filling Heuristic</h3>
            <p>
              SECOND SUN does <strong>not</strong> claim to be a mathematically optimal global max-min
              solver. It implements a deterministic, bounded <strong>progressive-filling heuristic</strong>:
            </p>
            <ol className="modal-list">
              <li>
                <strong>Progressive Round-Robin:</strong> At each step, the scheduler identifies all cohorts
                with unmet demand who have at least one feasible room-slot option.
              </li>
              <li>
                <strong>Fairness Prioritization:</strong> The cohort with the lowest current coverage ratio
                (<code>allocated / requested</code>) is selected for the next assignment. Ties are broken
                deterministically by cohort ID.
              </li>
              <li>
                <strong>Contention-Aware Candidate Selection:</strong> Among feasible candidates for that cohort,
                the engine selects the candidate with the lowest power draw (watts), then the lowest slot
                contention (fewest competing groups wanting that slot), then earliest slot.
              </li>
              <li>
                <strong>Termination:</strong> Stops when all requests are fulfilled or no candidate can be placed
                without violating energy, peak power, room occupancy, or eligibility limits.
              </li>
            </ol>
          </section>

          {/* Section 3 */}
          <section className="modal-section">
            <h3 className="section-title">3. Rigorous Energy Accounting</h3>
            <p>
              Each planning day is discretized into <strong>48 half-hour slots</strong> (indices 0–47).
              One slot at <em>P</em> watts consumes <code>P × 30</code> watt-minutes (Wm). Total daily energy
              equals <code>sum(Wm) / 60,000 kWh</code>. Integer arithmetic is maintained internally to eliminate
              floating-point boundary discrepancies.
            </p>
          </section>

          {/* Section 4 */}
          <section className="modal-section">
            <h3 className="section-title">4. Scientific & Medical Integrity Guardrails</h3>
            <div className="warning-box">
              <h4>⚠️ Honest Scientific Boundaries</h4>
              <ul>
                <li>
                  <strong>No Health or Medical Claims:</strong> SECOND SUN schedules access opportunities; it
                  does not prescribe light therapy, treat circadian disorders, or predict biological outcomes.
                </li>
                <li>
                  <strong>Correlated Color Temperature (CCT) is Not a Biological Proxy:</strong> Peer-reviewed
                  research (Nature Scientific Reports 2022) demonstrates that CCT (Kelvin) cannot predict
                  melanopic biological effect without spectral power distribution and eye-level geometry.
                </li>
                <li>
                  <strong>Planning Assumptions vs Clinical Truth:</strong> “Preferred exposure windows” in this
                  app are user-configured planning assumptions based on work/wake schedules, not validated
                  clinical prescriptions.
                </li>
                <li>
                  <strong>Untouchable Safety Lighting:</strong> Emergency egress, exit lighting, corridor safety,
                  and life-critical monitors are powered by separate isolated circuits and are{' '}
                  <strong>never</strong> throttled or scheduled as discretionary load (OSHA 1910.37 compliant).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="modal-section">
            <h3 className="section-title">5. Scientific & Regulatory References</h3>
            <ul className="ref-list">
              <li>
                <a
                  href="https://www.cie.co.at/publications/cie-position-statement-integrative-lighting-recommending-proper-light-proper-time-3rd"
                  target="_blank"
                  rel="noreferrer"
                >
                  CIE Position Statement on Integrative Lighting (3rd Edition, 2024)
                </a>
              </li>
              <li>
                <a
                  href="https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001571"
                  target="_blank"
                  rel="noreferrer"
                >
                  Brown et al. — Recommendations for daytime, evening, and nighttime indoor light exposure (PLOS Biology, 2022)
                </a>
              </li>
              <li>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/38934353/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Circadian-informed lighting in submarine environments (Sleep, 2024)
                </a>
              </li>
              <li>
                <a
                  href="https://www.nature.com/articles/s41598-022-21755-7"
                  target="_blank"
                  rel="noreferrer"
                >
                  Correlated color temperature is not a suitable proxy for the biological potency of light (Scientific Reports, 2022)
                </a>
              </li>
              <li>
                <a
                  href="https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37"
                  target="_blank"
                  rel="noreferrer"
                >
                  OSHA 1910.37 — Maintenance, safeguards, and operational features for exit routes
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got it, return to operations
          </button>
        </div>
      </div>
    </div>
  );
};
