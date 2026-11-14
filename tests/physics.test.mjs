import test from 'node:test';
import assert from 'node:assert/strict';

import {
  G0,
  EARTH_RADIUS_M,
  calculateGravity,
  calculateAirDensity,
  calculateDragForce,
  calculateDragVector,
  calculateThrust,
  calculateThrustVector,
  calculateFuelFlow,
  calculateRocketMass,
  calculateTWR,
  calculateDeltaV,
  getIdealPitch,
  stepRocketSimulationAdvanced
} from '../src/missions/rocket-launch/rocketPhysics.ts';

const mockCapsule = {
  id: 'capsule-1',
  name: 'Orion Crew',
  massKg: 9000,
  dragCoeff: 0.28,
  crew: 4,
  description: 'Test capsule'
};

const mockTank = {
  id: 'tank-1',
  name: 'Standard Hydrolox',
  fuelKg: 100000,
  dryMassKg: 10000,
  burnSeconds: 60,
  description: 'Test tank'
};

const mockEngine = {
  id: 'engine-1',
  name: 'Raptor Cluster',
  thrustKn: 6000,
  fuelConsumptionRateKgPerSec: 1500,
  isp: 350,
  description: 'Test engine'
};

function createBaseTelemetry(overrides = {}) {
  return {
    timeSec: 0,
    altitudeM: 0,
    horizontalDistM: 0,
    velocityMps: 0,
    velocityYMps: 0,
    velocityXMps: 0,
    accelerationMps2: 0,
    accelerationYMps2: 0,
    accelerationXMps2: 0,
    pitchDeg: 0,
    massKg: 119000,
    fuelKg: 100000,
    stage1FuelKg: 65000,
    stage2FuelKg: 35000,
    isStage1BurnedOut: false,
    isStageSeparated: false,
    engineBurnedOut: false,
    throttle: 1.0,
    thrustN: 0,
    fuelFlowRateKgPerSec: 0,
    gravityMps2: G0,
    airDensityKgPm3: 1.225,
    dragN: 0,
    twr: 0,
    orbitAchieved: false,
    crashed: false,
    maxQPassed: false,
    mach1Passed: false,
    inCorridor: true,
    corridorScore: 0,
    starsCollected: 0,
    shakeIntensity: 0,
    ...overrides
  };
}

// -------------------------------------------------------------
// Core Physics Equations & Unit Formulas
// -------------------------------------------------------------
test('1. Rocket Mass Calculations (m = m_dry + m_fuel)', () => {
  const fullMass = calculateRocketMass(mockCapsule, mockTank, 100000, false);
  assert.equal(fullMass, 119000);

  const dryMass = calculateRocketMass(mockCapsule, mockTank, 0, false);
  assert.equal(dryMass, 19000);

  const separatedMass = calculateRocketMass(mockCapsule, mockTank, 35000, true);
  assert.equal(separatedMass, 9000 + 10000 * 0.35 + 35000);
});

test('2. Thrust-To-Weight Ratio (TWR = Thrust / (m * g))', () => {
  const twrHigh = calculateTWR(200000, 10000, 0);
  assert.ok(twrHigh > 2.0 && twrHigh < 2.05);

  const twrLow = calculateTWR(50000, 10000, 0);
  assert.ok(twrLow < 1.0);
});

test('3. Tsiolkovsky Delta-V Equation', () => {
  const deltaV = calculateDeltaV(350, 100000, 20000);
  assert.ok(deltaV > 5500 && deltaV < 5600);
});

test('4. Ideal Pitch Gravity Turn Profile', () => {
  assert.equal(getIdealPitch(500), 2);
  const pitch10k = getIdealPitch(10000);
  assert.ok(pitch10k >= 19 && pitch10k <= 21);
  const pitch50k = getIdealPitch(50000);
  assert.ok(pitch50k >= 54 && pitch50k <= 56);
  assert.equal(getIdealPitch(140000), 85);
});

// -------------------------------------------------------------
// Section 7: Required Physics Validation Tests (10/10)
// -------------------------------------------------------------

test('Validation Test 1: Engine off on launchpad — rocket remains supported by ground', () => {
  const initial = createBaseTelemetry({
    altitudeM: 0,
    velocityYMps: 0,
    velocityXMps: 0,
    velocityMps: 0
  });

  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    mockEngine,
    0.0, // Engine off (Throttle = 0)
    0,
    false,
    0.1
  );

  assert.equal(next.altitudeM, 0, 'Altitude must remain zero on launchpad');
  assert.equal(next.velocityMps, 0, 'Speed must remain zero on launchpad');
  assert.equal(next.accelerationMps2, 0, 'Acceleration must be zero when supported by ground');
  assert.equal(next.crashed, false, 'Rocket must not crash when supported on pad');
});

test('Validation Test 2: Engine off in flight — gravity changes rocket velocity downward', () => {
  const initial = createBaseTelemetry({
    altitudeM: 50000, // 50 km high (stratosphere/mesosphere)
    velocityYMps: 100, // moving up at 100 m/s
    velocityMps: 100
  });

  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    mockEngine,
    0.0, // Engine off
    0,
    false,
    1.0 // 1 second
  );

  assert.ok(next.velocityYMps < 100, 'Vertical velocity must decrease due to gravity');
  assert.ok(next.accelerationYMps2 < 0, 'Vertical acceleration must be negative (downward)');
  assert.ok(Math.abs(next.accelerationYMps2 + next.gravityMps2) < 1.0, 'Acceleration should match downward gravity & small drag');
});

test('Validation Test 3: Thrust balances weight in vertical flight — vertical acceleration is ~0', () => {
  // In vacuum (120 km) with 0 drag
  const alt = 120000;
  const mass = calculateRocketMass(mockCapsule, mockTank, 50000, false);
  const localG = calculateGravity(alt);
  const weightForce = mass * localG;

  // Custom engine whose thrust exactly equals weightForce
  const balancedEngine = {
    ...mockEngine,
    thrustKn: weightForce / 1000,
    fuelConsumptionRateKgPerSec: 0.001 // tiny fuel burn for pure balance test
  };

  const initial = createBaseTelemetry({
    altitudeM: alt,
    pitchDeg: 0, // vertical
    velocityYMps: 500,
    velocityMps: 500,
    massKg: mass,
    stage1FuelKg: 50000,
    stage2FuelKg: 0
  });

  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    balancedEngine,
    1.0, // full throttle gives exact weightForce
    0,
    false,
    0.05
  );

  assert.ok(
    Math.abs(next.accelerationYMps2) < 0.2,
    `Vertical acceleration must be approximately 0 when thrust balances weight (got: ${next.accelerationYMps2})`
  );
});

test('Validation Test 4: Thrust exceeds weight — rocket accelerates upward', () => {
  const initial = createBaseTelemetry({
    altitudeM: 0,
    stage1FuelKg: 65000
  });

  // Engine has 6000 kN thrust, mass is 119 t -> Weight is ~1167 kN -> TWR ~5.1
  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    mockEngine,
    1.0,
    0,
    false,
    0.5
  );

  assert.ok(next.accelerationYMps2 > 0, 'Vertical acceleration must be positive');
  assert.ok(next.velocityYMps > 0, 'Rocket must gain upward vertical velocity');
  assert.ok(next.altitudeM > 0, 'Rocket must lift off the pad');
});

test('Validation Test 5: Throttle increases — thrust and fuel flow increase', () => {
  const fuel = 50000;
  const thrustHalf = calculateThrust(0.5, 6000000, fuel);
  const thrustFull = calculateThrust(1.0, 6000000, fuel);
  assert.equal(thrustFull, thrustHalf * 2, 'Thrust must scale proportionally with throttle');

  const flowHalf = calculateFuelFlow(0.5, 1500, fuel);
  const flowFull = calculateFuelFlow(1.0, 1500, fuel);
  assert.equal(flowFull, flowHalf * 2, 'Fuel flow must scale proportionally with throttle');
});

test('Validation Test 6: Fuel is consumed — total rocket mass decreases', () => {
  const initial = createBaseTelemetry({
    altitudeM: 1000,
    stage1FuelKg: 50000,
    stage2FuelKg: 35000,
    velocityYMps: 100
  });

  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    mockEngine,
    1.0,
    0,
    false,
    1.0 // 1 second burn
  );

  assert.ok(next.stage1FuelKg < initial.stage1FuelKg, 'Stage 1 fuel must decrease');
  assert.ok(next.massKg < initial.massKg, 'Total mass must decrease as fuel is consumed');
  assert.equal(
    next.massKg,
    calculateRocketMass(mockCapsule, mockTank, next.stage1FuelKg + next.stage2FuelKg),
    'Mass must match dry mass + remaining fuel'
  );
});

test('Validation Test 7: Fuel reaches zero — engine thrust stops', () => {
  const initial = createBaseTelemetry({
    altitudeM: 30000,
    stage1FuelKg: 0, // no fuel
    stage2FuelKg: 0,
    velocityYMps: 200,
    velocityMps: 200
  });

  const next = stepRocketSimulationAdvanced(
    initial,
    mockCapsule,
    mockTank,
    mockEngine,
    1.0,
    0,
    false,
    0.1
  );

  assert.equal(next.thrustN, 0, 'Thrust must be zero when fuel is zero');
  assert.equal(next.fuelFlowRateKgPerSec, 0, 'Fuel flow rate must be zero');
  assert.ok(next.accelerationYMps2 < 0, 'Rocket must decelerate under gravity with zero thrust');
});

test('Validation Test 8: Rocket speed increases in atmosphere — drag magnitude increases', () => {
  const alt = 5000;
  const dragAt100 = calculateDragForce(100, alt, 0.28, 10);
  const dragAt200 = calculateDragForce(200, alt, 0.28, 10);

  // Drag is proportional to v^2, so doubling speed quadruples drag:
  assert.ok(dragAt200 > dragAt100 * 3.9 && dragAt200 < dragAt100 * 4.1, 'Drag must scale quadratically with speed');
});

test('Validation Test 9: Rocket enters thin atmosphere — drag decreases', () => {
  const speed = 300;
  const seaLevelDrag = calculateDragForce(speed, 0, 0.28, 10);
  const highAltDrag = calculateDragForce(speed, 40000, 0.28, 10);
  const vacuumDrag = calculateDragForce(speed, 110000, 0.28, 10);

  assert.ok(seaLevelDrag > highAltDrag, 'Drag at sea level must be higher than at 40 km');
  assert.ok(highAltDrag > vacuumDrag, 'Drag at 40 km must be higher than in space');
  assert.equal(vacuumDrag, 0, 'Drag in orbital vacuum must be 0');
});

test('Validation Test 10: Rocket tilts — thrust follows the rocket orientation', () => {
  const thrustMagnitude = 5000000; // 5 MN

  // Vertical (pitch = 0)
  const vecVertical = calculateThrustVector(thrustMagnitude, 0);
  assert.equal(vecVertical.x, 0);
  assert.equal(vecVertical.y, thrustMagnitude);

  // Tilted 30 degrees
  const vec30 = calculateThrustVector(thrustMagnitude, 30);
  const expectedX = thrustMagnitude * Math.sin((30 * Math.PI) / 180);
  const expectedY = thrustMagnitude * Math.cos((30 * Math.PI) / 180);
  assert.ok(Math.abs(vec30.x - expectedX) < 1.0);
  assert.ok(Math.abs(vec30.y - expectedY) < 1.0);
  assert.ok(vec30.x > 0, 'Tilted rocket must produce horizontal thrust');
  assert.ok(vec30.y < thrustMagnitude, 'Vertical thrust component must be less than total thrust');
});
