import test from 'node:test';
import assert from 'node:assert/strict';

import {
  G0,
  calculateRocketMass,
  calculateGravity,
  calculateAirDensity,
  calculateDragForce,
  calculateThrust,
  getIdealPitch,
  stepRocketSimulationAdvanced
} from '../src/missions/rocket-launch/rocketPhysics.ts';

const orionCapsule = {
  id: 'orion-crew',
  name: 'Orion 4-Astronaut Capsule',
  massKg: 9300,
  dragCoeff: 0.28,
  crew: 4,
  description: 'Standard crew capsule'
};

const hydroloxTank = {
  id: 'tank-standard',
  name: 'Cryogenic Dual-Stage Tank (Medium)',
  fuelKg: 115000,
  dryMassKg: 9500,
  burnSeconds: 60,
  description: 'Standard propellant core'
};

const raptorEngine = {
  id: 'engine-cluster',
  name: 'Raptor-X Tri-Engine Cluster',
  thrustKn: 6600,
  fuelConsumptionRateKgPerSec: 1550,
  isp: 350,
  description: 'High efficiency staged combustion cluster'
};

function createInitialTelemetry() {
  const initialMass = calculateRocketMass(orionCapsule, hydroloxTank, hydroloxTank.fuelKg, false);
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
    massKg: initialMass,
    fuelKg: hydroloxTank.fuelKg,
    stage1FuelKg: hydroloxTank.fuelKg * 0.65,
    stage2FuelKg: hydroloxTank.fuelKg * 0.35,
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
    shakeIntensity: 0
  };
}

// ---------------------------------------------------------------------------
// 1. Mission Lifecycle & Flight Regime Integration Tests
// ---------------------------------------------------------------------------

test('Sim Integration 1: Complete Liftoff to Supersonic Mach 1 Transition', () => {
  let tel = createInitialTelemetry();
  const dt = 0.05;

  // Run liftoff phase until Mach 1 (> 343 m/s)
  let steps = 0;
  while (!tel.mach1Passed && steps < 1000 && !tel.crashed) {
    tel = stepRocketSimulationAdvanced(
      tel,
      orionCapsule,
      hydroloxTank,
      raptorEngine,
      1.0, // 100% throttle
      0,   // vertical
      false,
      dt
    );
    steps++;
  }

  assert.ok(tel.mach1Passed, 'Rocket must pass Mach 1 speed');
  assert.ok(tel.velocityMps > 343, `Speed must exceed 343 m/s (got ${tel.velocityMps.toFixed(1)})`);
  assert.ok(tel.altitudeM > 1000, `Altitude must be significant (got ${tel.altitudeM.toFixed(1)}m)`);
  assert.ok(tel.stage1FuelKg < hydroloxTank.fuelKg * 0.65, 'Stage 1 propellant must be consumed');
});

test('Sim Integration 2: Transonic Max-Q Aerodynamic Dynamic Pressure Peak', () => {
  let tel = createInitialTelemetry();
  const dt = 0.05;

  let maxDynamicPressure = 0;
  let altitudeAtMaxQ = 0;

  // Fly through lower atmosphere (0 to 25 km)
  for (let s = 0; s < 500; s++) {
    tel = stepRocketSimulationAdvanced(
      tel,
      orionCapsule,
      hydroloxTank,
      raptorEngine,
      1.0,
      0.1, // slight gravity turn
      false,
      dt
    );

    const q = 0.5 * tel.airDensityKgPm3 * (tel.velocityMps * tel.velocityMps);
    if (q > maxDynamicPressure) {
      maxDynamicPressure = q;
      altitudeAtMaxQ = tel.altitudeM;
    }
  }

  // Max-Q on realistic Earth launches typically occurs between 8 km and 16 km
  assert.ok(maxDynamicPressure > 10000, `Max-Q peak pressure should exceed 10 kPa (got ${maxDynamicPressure.toFixed(0)} Pa)`);
  assert.ok(altitudeAtMaxQ > 5000 && altitudeAtMaxQ < 25000, `Max-Q must occur in troposphere/lower stratosphere (got ${altitudeAtMaxQ.toFixed(0)}m)`);
});

test('Sim Integration 3: Stage 1 Burnout, Booster Separation, and Stage 2 Ignition', () => {
  let tel = createInitialTelemetry();
  // Fast-forward fuel to near Stage 1 burnout
  tel.stage1FuelKg = 200; // only 200 kg remaining
  tel.altitudeM = 40000;  // 40 km high
  tel.velocityYMps = 1200;
  tel.velocityMps = 1200;
  tel.pitchDeg = 45;

  // Step forward until Stage 1 burns out
  for (let i = 0; i < 10; i++) {
    tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 1.0, 0, false, 0.1);
  }

  assert.equal(tel.isStage1BurnedOut, true, 'Stage 1 must report burnout when fuel depleted');
  assert.equal(tel.stage1FuelKg, 0, 'Stage 1 fuel must be 0');
  assert.equal(tel.isStageSeparated, false, 'Stage must not be separated before trigger');

  // Trigger stage separation
  tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 1.0, 0, true, 0.1);

  assert.equal(tel.isStageSeparated, true, 'Stage must be separated after trigger');
  assert.ok(tel.stage2FuelKg > 0, 'Stage 2 fuel must be available');
  assert.ok(tel.thrustN > 0, 'Stage 2 vacuum engine must ignite and produce thrust');
});

test('Sim Integration 4: Lateral Steering & Gravity Turn Trajectory Drift', () => {
  let tel = createInitialTelemetry();
  tel.altitudeM = 15000;
  tel.velocityYMps = 600;
  tel.velocityMps = 600;

  // Apply maximum right steering [D] (+1) for 3 seconds
  for (let i = 0; i < 60; i++) {
    tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 1.0, 1.0, false, 0.05);
  }

  assert.ok(tel.pitchDeg > 20, `Pitch must tilt down toward horizontal (got ${tel.pitchDeg.toFixed(1)} deg)`);
  assert.ok(tel.velocityXMps > 50, `Horizontal velocity must build up (got ${tel.velocityXMps.toFixed(1)} m/s)`);
  assert.ok(tel.horizontalDistM > 0, `Downrange ground distance must increase (got ${tel.horizontalDistM.toFixed(1)} m)`);
});

test('Sim Integration 5: Sub-Orbital Abort & Safe Touchdown Landing Check', () => {
  let tel = createInitialTelemetry();
  tel.timeSec = 10;
  tel.altitudeM = 2.0;    // 2.0 meters above surface
  tel.velocityYMps = -4;  // gentle terminal descent velocity -4 m/s (well within <= 12 m/s limit)
  tel.velocityXMps = 1;   // gentle lateral speed 1 m/s (well within <= 8 m/s limit)
  tel.pitchDeg = 3;       // upright orientation (well within <= 18 deg limit)

  // Step until rocket contacts the ground
  let steps = 0;
  while (tel.altitudeM > 0 && steps < 30) {
    tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 0.0, 0, false, 0.05);
    steps++;
  }

  assert.equal(tel.altitudeM, 0, 'Rocket must be on ground (altitude = 0)');
  assert.equal(tel.crashed, false, 'Gentle descent must register as safe touchdown, not crash');
});

test('Sim Integration 6: Hard Crash Detection on High-Speed Ground Impact', () => {
  let tel = createInitialTelemetry();
  tel.timeSec = 15;
  tel.altitudeM = 50;     // 50m above ground
  tel.velocityYMps = -80; // extreme slam velocity -80 m/s
  tel.pitchDeg = 45;      // heavy tilt

  // Impact ground
  for (let i = 0; i < 5; i++) {
    tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 0.0, 0, false, 0.2);
  }

  assert.equal(tel.altitudeM, 0, 'Rocket hits ground');
  assert.equal(tel.crashed, true, 'High-velocity impact must register as crashed');
});

test('Sim Integration 7: LEO Orbital Insertion Target Achievement', () => {
  let tel = createInitialTelemetry();
  tel.altitudeM = 138000; // 138 km (LEO orbit altitude)
  tel.velocityXMps = 7200; // orbital horizontal speed
  tel.velocityYMps = 50;
  tel.velocityMps = Math.sqrt(7200 * 7200 + 50 * 50);
  tel.pitchDeg = 85;

  tel = stepRocketSimulationAdvanced(tel, orionCapsule, hydroloxTank, raptorEngine, 1.0, 0, false, 0.05);

  assert.equal(tel.orbitAchieved, true, 'LEO altitude and orbital velocity must achieve orbit');
});
