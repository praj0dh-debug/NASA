export interface RocketConfig {
  capsuleId: string;
  tankId: string;
  engineId: string;
  pitchAngleDeg: number;
  throttlePercent: number;
}

export interface CapsuleSpec {
  id: string;
  name: string;
  massKg: number;
  dragCoeff: number;
  crew: number;
  description: string;
}

export interface TankSpec {
  id: string;
  name: string;
  fuelKg: number;
  dryMassKg: number;
  burnSeconds: number;
  description: string;
}

export interface EngineSpec {
  id: string;
  name: string;
  thrustKn: number;
  fuelConsumptionRateKgPerSec: number;
  isp: number;
  description: string;
}

export interface FlightTelemetry {
  timeSec: number;
  altitudeM: number;
  velocityMps: number;
  horizontalDistM: number;
  pitchDeg: number; // Current rocket flight angle (0 = straight up, 90 = horizontal)
  accelerationMps2: number;
  stage1FuelKg: number;
  stage2FuelKg: number;
  isStage1BurnedOut: boolean;
  isStageSeparated: boolean;
  thrustN: number;
  dragN: number;
  twr: number;
  orbitAchieved: boolean;
  crashed: boolean;
  engineBurnedOut: boolean;
  maxQPassed: boolean;
  mach1Passed: boolean;
  inCorridor: boolean;
  corridorScore: number;
  starsCollected: number;
  shakeIntensity: number;
}

const G0 = 9.80665;
const EARTH_RADIUS_M = 6371000;
const SEA_LEVEL_AIR_DENSITY = 1.225; // kg/m^3
const SCALE_HEIGHT_M = 8500;
const REFERENCE_AREA_M2 = 10.0;

export function calculateRocketMass(
  capsule: CapsuleSpec,
  tank: TankSpec,
  fuelRemainingKg: number,
  isStageSeparated: boolean = false
): number {
  if (isStageSeparated) {
    // Upper stage is only capsule + 35% of tank dry mass + remaining fuel
    return capsule.massKg + tank.dryMassKg * 0.35 + fuelRemainingKg;
  }
  return capsule.massKg + tank.dryMassKg + fuelRemainingKg;
}

export function calculateTWR(thrustN: number, massKg: number, altitudeM: number): number {
  const g = G0 * Math.pow(EARTH_RADIUS_M / (EARTH_RADIUS_M + altitudeM), 2);
  const weight = massKg * g;
  return weight > 0 ? thrustN / weight : 0;
}

export function calculateDeltaV(
  isp: number,
  initialMassKg: number,
  dryMassKg: number
): number {
  if (dryMassKg <= 0 || initialMassKg <= dryMassKg) return 0;
  return isp * G0 * Math.log(initialMassKg / dryMassKg);
}

// Target pitch corridor for an ideal gravity turn as a function of altitude in meters
export function getIdealPitch(altitudeM: number): number {
  if (altitudeM < 1500) return 2; // Vertical clearing
  if (altitudeM < 10000) return 5 + ((altitudeM - 1500) / 8500) * 15; // 5 to 20 deg
  if (altitudeM < 50000) return 20 + ((altitudeM - 10000) / 40000) * 35; // 20 to 55 deg
  if (altitudeM < 120000) return 55 + ((altitudeM - 50000) / 70000) * 25; // 55 to 80 deg
  return 85; // Nearly horizontal circularization burn in vacuum
}

export function stepRocketSimulationAdvanced(
  tel: FlightTelemetry,
  capsule: CapsuleSpec,
  tank: TankSpec,
  engine: EngineSpec,
  throttle: number, // 0 to 1
  steerInput: number, // -1 (tilt left) to +1 (tilt right)
  triggerStaging: boolean,
  dt: number = 0.05
): FlightTelemetry {
  if (tel.crashed || tel.orbitAchieved) {
    return tel;
  }

  // Smoothly steer pitch
  let pitchDeg = tel.pitchDeg + steerInput * 24 * dt;
  pitchDeg = Math.max(0, Math.min(88, pitchDeg));

  let isStageSeparated = tel.isStageSeparated;
  let shakeIntensity = Math.max(0, tel.shakeIntensity - dt * 4);

  // Staging
  if (triggerStaging && !isStageSeparated && tel.altitudeM > 5000) {
    isStageSeparated = true;
    shakeIntensity = 8.0; // Big bump on staging
  }

  // Two-stage fuel distribution: 65% Stage 1, 35% Stage 2
  let s1Fuel = tel.stage1FuelKg;
  let s2Fuel = tel.stage2FuelKg;
  let thrustN = 0;
  let isStage1BurnedOut = tel.isStage1BurnedOut;
  let engineBurnedOut = false;

  const currentThrottle = Math.max(0, Math.min(1.0, throttle));

  if (!isStageSeparated) {
    // Stage 1 firing
    if (s1Fuel > 0 && currentThrottle > 0) {
      const consumption = (engine.fuelConsumptionRateKgPerSec * 1.05) * currentThrottle * dt;
      if (s1Fuel >= consumption) {
        s1Fuel -= consumption;
        thrustN = engine.thrustKn * 1000 * currentThrottle;
      } else {
        thrustN = engine.thrustKn * 1000 * currentThrottle * (s1Fuel / consumption);
        s1Fuel = 0;
        isStage1BurnedOut = true;
      }
      shakeIntensity = Math.max(shakeIntensity, currentThrottle * 2.5);
    } else {
      isStage1BurnedOut = true;
    }
  } else {
    // Stage 2 Vacuum Engine Firing (Higher efficiency Isp, lower consumption)
    if (s2Fuel > 0 && currentThrottle > 0) {
      const upperConsumption = (engine.fuelConsumptionRateKgPerSec * 0.4) * currentThrottle * dt;
      if (s2Fuel >= upperConsumption) {
        s2Fuel -= upperConsumption;
        thrustN = (engine.thrustKn * 0.75) * 1000 * currentThrottle;
      } else {
        thrustN = (engine.thrustKn * 0.75) * 1000 * currentThrottle * (s2Fuel / upperConsumption);
        s2Fuel = 0;
        engineBurnedOut = true;
      }
      shakeIntensity = Math.max(shakeIntensity, currentThrottle * 1.5);
    } else {
      engineBurnedOut = true;
    }
  }

  const activeFuel = isStageSeparated ? s2Fuel : (s1Fuel + s2Fuel);
  const currentMass = calculateRocketMass(capsule, tank, activeFuel, isStageSeparated);

  const g = G0 * Math.pow(EARTH_RADIUS_M / (EARTH_RADIUS_M + tel.altitudeM), 2);
  const weightForce = currentMass * g;

  // Atmospheric density
  const airDensity = tel.altitudeM < 100000
    ? SEA_LEVEL_AIR_DENSITY * Math.exp(-tel.altitudeM / SCALE_HEIGHT_M)
    : 0;

  // Aerodynamic Drag
  const v = tel.velocityMps;
  const dragN = 0.5 * airDensity * (v * v) * capsule.dragCoeff * (isStageSeparated ? 4.5 : REFERENCE_AREA_M2);
  const qPressurePa = 0.5 * airDensity * (v * v);
  const maxQPassed = tel.maxQPassed || (tel.altitudeM > 11000 && qPressurePa < 18000);
  const mach1Passed = tel.mach1Passed || (v > 343);

  // Check corridor alignment
  const idealPitch = getIdealPitch(tel.altitudeM);
  const pitchError = Math.abs(pitchDeg - idealPitch);
  const inCorridor = pitchError <= 14;
  const corridorBonus = inCorridor ? 20 * dt : 0;

  // Net accelerations
  const pitchRad = (pitchDeg * Math.PI) / 180;
  const thrustVertical = thrustN * Math.cos(pitchRad);
  const thrustHorizontal = thrustN * Math.sin(pitchRad);

  const netVerticalForce = thrustVertical - weightForce - (dragN * Math.cos(pitchRad));
  const netHorizontalForce = thrustHorizontal - (dragN * Math.sin(pitchRad));

  const vertAccel = netVerticalForce / currentMass;
  const horizAccel = netHorizontalForce / currentMass;

  let vertVelocity = (v * Math.cos(pitchRad)) + vertAccel * dt;
  let horizVelocity = (v * Math.sin(pitchRad)) + horizAccel * dt;

  let newAltitude = tel.altitudeM + vertVelocity * dt;
  let newHorizontalDist = tel.horizontalDistM + horizVelocity * dt;
  let newVelocity = Math.sqrt(vertVelocity * vertVelocity + horizVelocity * horizVelocity);

  let crashed = false;
  let orbitAchieved = false;

  // Ground collision check
  if (newAltitude <= 0) {
    newAltitude = 0;
    if (tel.timeSec > 3 && vertVelocity < -8) {
      crashed = true;
      shakeIntensity = 12.0;
    } else {
      vertVelocity = 0;
      newVelocity = 0;
    }
  }

  // Orbit achieved criteria:
  // LEO target: Altitude >= 140 km and Velocity >= 7,100 m/s with horizontal vector
  if (newAltitude >= 135000 && newVelocity >= 7100) {
    orbitAchieved = true;
    shakeIntensity = 0;
  }

  const twr = calculateTWR(thrustN, currentMass, newAltitude);

  return {
    timeSec: tel.timeSec + dt,
    altitudeM: Math.max(0, newAltitude),
    velocityMps: Math.max(0, newVelocity),
    horizontalDistM: Math.max(0, newHorizontalDist),
    pitchDeg,
    accelerationMps2: (thrustN - weightForce) / currentMass,
    stage1FuelKg: Math.max(0, s1Fuel),
    stage2FuelKg: Math.max(0, s2Fuel),
    isStage1BurnedOut,
    isStageSeparated,
    thrustN,
    dragN,
    twr,
    orbitAchieved,
    crashed,
    engineBurnedOut,
    maxQPassed,
    mach1Passed,
    inCorridor,
    corridorScore: tel.corridorScore + corridorBonus,
    starsCollected: tel.starsCollected,
    shakeIntensity
  };
}
