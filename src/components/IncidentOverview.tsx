import React from 'react';
import type { Scenario, ScheduleResult } from '../domain/types';

interface IncidentOverviewProps {
  scenario: Scenario;
  result: ScheduleResult;
  baseBudgetKWh: number;
}

export const IncidentOverview: React.FC<IncidentOverviewProps> = ({
  scenario,
  result,
  baseBudgetKWh,
}) => {
  const totalPopulation = scenario.cohorts.reduce((acc, c) => acc + c.populationPeople, 0);
  const totalRequestedSlots = scenario.cohorts.reduce((acc, c) => acc + c.requestedSlots, 0);
  const totalAllocatedSlots = result.assignments.length;
  const unmetSessions = result.metrics.unmet;

  const activeRooms = scenario.rooms.filter(r => r.enabled);
  const totalCapacity = activeRooms.reduce((acc, r) => acc + r.capacityPeople, 0);

  const powerPercent = baseBudgetKWh > 0 ? Math.round((scenario.budgetKWh / baseBudgetKWh) * 100) : 100;
  const lossPercent = Math.max(0, 100 - powerPercent);

  return (
    <section className="incident-overview-section" aria-label="Incident Overview">
      {/* Incident Status Eyebrow */}
      <div className="incident-status-bar">
        <span className="incident-pulse-dot" aria-hidden="true" />
        <span className="incident-tag">
          {powerPercent < 100 ? 'INCIDENT IN PROGRESS · GEOTHERMAL POWER LOSS' : 'GRID NOMINAL · FULL CAPACITY'}
        </span>
      </div>

      {/* Primary Narrative */}
      <div className="incident-hero">
        <h1 className="incident-headline">
          {powerPercent < 100
            ? `Your community just lost ${lossPercent}% of its available daylight power.`
            : 'Discretionary lighting grid operating at 100% capacity.'}
        </h1>
        <p className="incident-subline">
          {scenario.cohorts.length} resident groups ({totalPopulation} people) rely on{' '}
          {scenario.rooms.length} shared bright-light rooms. With discretionary power rationed to{' '}
          <strong>{scenario.budgetKWh.toFixed(2)} kWh</strong>, there is only enough electricity for{' '}
          <strong>{totalAllocatedSlots} of {totalRequestedSlots}</strong> requested sessions.
          SECOND SUN has calculated an actionable operations schedule below.
        </p>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="incident-telemetry-grid">
        <div className="telemetry-card">
          <span className="telemetry-label">Available Lighting Energy</span>
          <span className="telemetry-value">
            {scenario.budgetKWh.toFixed(2)} <span className="telemetry-unit">kWh</span>
          </span>
          <span className="telemetry-sub">{powerPercent}% of normal budget</span>
        </div>

        <div className="telemetry-card">
          <span className="telemetry-label">Affected Population</span>
          <span className="telemetry-value">
            {totalPopulation} <span className="telemetry-unit">residents</span>
          </span>
          <span className="telemetry-sub">{scenario.cohorts.length} sectors across Levels 2–9</span>
        </div>

        <div className="telemetry-card">
          <span className="telemetry-label">Operational Rooms</span>
          <span className="telemetry-value">
            {activeRooms.length} of {scenario.rooms.length} <span className="telemetry-unit">online</span>
          </span>
          <span className="telemetry-sub">{totalCapacity} concurrent capacity</span>
        </div>

        <div className="telemetry-card">
          <span className="telemetry-label">Unaccommodated Requests</span>
          <span className="telemetry-value text-deficit">
            {unmetSessions} <span className="telemetry-unit">sessions</span>
          </span>
          <span className="telemetry-sub">
            {totalRequestedSlots > 0 ? Math.round((unmetSessions / totalRequestedSlots) * 100) : 0}% unserved demand
          </span>
        </div>
      </div>
    </section>
  );
};
