import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateRocketMass,
  calculateTWR,
  calculateDeltaV,
  getIdealPitch,
  stepRocketSimulationAdvanced
} from '../src/missions/rocket-launch/rocketPhysics.ts';

test('1. Rocket Mass Calculations', () => {
  const capsule = { id: 'capsule-1', name: 'Crew', massKg: 9000, dragCoeff: 0.28, crew: 4, description: '' };
  const tank = { id: 'tank-1', name: 'Tank', fuelKg: 100000, dryMassKg: 10000, burnSeconds: 60, description: '' };

  const fullMass = calculateRocketMass(capsule, tank, 100000, false);
  assert.equal(fullMass, 119000);

  const dryMass = calculateRocketMass(capsule, tank, 0, false);
  assert.equal(dryMass, 19000);

  const separatedMass = calculateRocketMass(capsule, tank, 30000, true);
  assert.equal(separatedMass, 9000 + 10000 * 0.35 + 30000);
});

test('2. Thrust-To-Weight Ratio (TWR)', () => {
  // If weight = 10,000 kg * 9.81 = 98,100 N
  // Thrust = 200,000 N -> TWR = 200,000 / 98,100 ≈ 2.038
  const twr = calculateTWR(200000, 10000, 0);
  assert.ok(twr > 2.0 && twr < 2.05);

  // If thrust = 50,000 N -> TWR < 1.0 (Cannot liftoff)
  const lowTwr = calculateTWR(50000, 10000, 0);
  assert.ok(lowTwr < 1.0);
});

test('3. Tsiolkovsky Delta-V Equation', () => {
  // Δv = Isp * g0 * ln(m0 / mf)
  const deltaV = calculateDeltaV(350, 100000, 20000);
  // 350 * 9.80665 * ln(5) ≈ 350 * 9.80665 * 1.6094 = ~5524 m/s
  assert.ok(deltaV > 5500 && deltaV < 5600);
});

test('4. Ideal Pitch Angle Gravity Turn Profile', () => {
  // Ground clearing
  assert.equal(getIdealPitch(500), 2);

  // Low atmosphere pitch
  const pitch10k = getIdealPitch(10000);
  assert.ok(pitch10k >= 19 && pitch10k <= 21);

  // Upper atmosphere pitch
  const pitch50k = getIdealPitch(50000);
  assert.ok(pitch50k >= 54 && pitch50k <= 56);

  // Vacuum orbital circularization
  const pitchOrbital = getIdealPitch(140000);
  assert.equal(pitchOrbital, 85);
});

test('5. Step Rocket Simulation Advanced: Thrust, Acceleration & Staging', () => {
  const capsule = { id: 'capsule-1', name: 'Crew', massKg: 9000, dragCoeff: 0.28, crew: 4, description: '' };
  const tank = { id: 'tank-1', name: 'Tank', fuelKg: 100000, dryMassKg: 10000, burnSeconds: 60, description: '' };
  const engine = { id: 'eng-1', name: 'Raptor', thrustKn: 6000, fuelConsumptionRateKgPerSec: 2000, isp: 350, description: '' };

  const initialTel = {
    timeSec: 0,
    altitudeM: 0,
    velocityMps: 0,
    horizontalDistM: 0,
    pitchDeg: 0,
    accelerationMps2: 0,
    stage1FuelKg: 65000,
    stage2FuelKg: 35000,
    isStage1BurnedOut: false,
    isStageSeparated: false,
    thrustN: 0,
    dragN: 0,
    twr: 0,
    orbitAchieved: false,
    crashed: false,
    engineBurnedOut: false,
    maxQPassed: false,
    mach1Passed: false,
    inCorridor: true,
    corridorScore: 0,
    starsCollected: 0,
    shakeIntensity: 0
  };

  // Run 1 second of simulation
  const nextTel = stepRocketSimulationAdvanced(
    initialTel,
    capsule,
    tank,
    engine,
    1.0,
    0,
    false,
    0.1
  );

  assert.ok(nextTel.altitudeM > 0);
  assert.ok(nextTel.velocityMps > 0);
  assert.ok(nextTel.stage1FuelKg < 65000);
  assert.equal(nextTel.isStageSeparated, false);
});
