// Sanity checks for the extracted prototype engine. These are NOT a comprehensive test suite.
const test = require('node:test');
const assert = require('node:assert/strict');
const { PRESETS, solve, validate, rng, kwhToWm } = require('./second-sun-engine.js');

test('half-hour slot conversion and overnight slot range', () => {
  assert.equal(kwhToWm(0.4), 24000);
  assert.deepEqual(rng(46, 2), [46, 47, 0, 1]);
});

test('toy scenario: fair strategy allocates one session to each group', () => {
  const scenario = PRESETS.toy();
  const fair = solve(scenario, 'fair');
  const first = solve(scenario, 'first');
  assert.equal(fair.m.minCov, 0.5);
  assert.equal(first.m.minCov, 0);
  assert.deepEqual(validate(scenario, fair), []);
  assert.deepEqual(validate(scenario, first), []);
});

test('full Hollow preset reproduces the provided result', () => {
  const scenario = PRESETS.hollow();
  const fair = solve(scenario, 'fair');
  const first = solve(scenario, 'first');
  assert.equal(fair.m.sessions, 15);
  assert.equal(first.m.sessions, 13);
  assert.equal(fair.m.kwh, 3.8);
  assert.deepEqual(validate(scenario, fair), []);
  assert.deepEqual(validate(scenario, first), []);
});

test('60% Hollow energy scenario produces a nontrivial shortage', () => {
  const scenario = PRESETS.hollow();
  scenario.budgetKWh = 2.28;
  const fair = solve(scenario, 'fair');
  const first = solve(scenario, 'first');
  assert.equal(fair.m.sessions, 9);
  assert.equal(first.m.sessions, 7);
  assert.equal(fair.m.minCov, 0.5);
  assert.deepEqual(validate(scenario, fair), []);
  assert.deepEqual(validate(scenario, first), []);
});

test('zero budget yields no assignments', () => {
  const scenario = PRESETS.hollow();
  scenario.budgetKWh = 0;
  const result = solve(scenario, 'fair');
  assert.equal(result.asg.length, 0);
  assert.deepEqual(validate(scenario, result), []);
});

test('disabled room is not assigned', () => {
  const scenario = PRESETS.hollow();
  scenario.rooms.find(r => r.id === 'R1').enabled = false;
  const result = solve(scenario, 'fair');
  assert.ok(result.asg.every(a => a.roomId !== 'R1'));
  assert.deepEqual(validate(scenario, result), []);
});
