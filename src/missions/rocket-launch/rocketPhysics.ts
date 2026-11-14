/**
 * NASA Artemis STEM Academy — Realistic Rocket Physics Engine
 *
 * Implements Newtonian 2D vector dynamics:
 * - Net Force: F_net = Thrust + F_gravity + F_drag
 * - Gravity: g(h) = g0 * (R / (R + h))^2
 * - Atmospheric Drag: F_d = -0.5 * rho(h) * |v| * Cd * A * v_vec
 * - Atmospheric Density: rho(h) = rho0 * e^(-h / H)
 * - Fuel Consumption & Variable Mass: dm/dt = -Throttle * m_dot_max, m = m_dry + m_fuel
 * - Semi-Implicit Euler integration for fixed timestep numerical stability
 */

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

export interface Vector2D {
  x: number;
  y: number;
}

export interface FlightTelemetry {
  // Time and coordinates
  timeSec: number;
  altitudeM: number;
  horizontalDistM: number;

  // Velocity (vector components & total speed)
  velocityMps: number;
  velocityYMps: number;
  velocityXMps: number;

  // Acceleration (vector components & total magnitude)
  accelerationMps2: number;
  accelerationYMps2: number;
  accelerationXMps2: number;

  // Orientation
  pitchDeg: number; // 0 = straight up (+Y), 90 = horizontal (+X)

  // Mass and Propulsion
  massKg: number;
  fuelKg: number;
  stage1FuelKg: number;
  stage2FuelKg: number;
  isStage1BurnedOut: boolean;
  isStageSeparated: boolean;
  engineBurnedOut: boolean;

  // Engine & Forces
  throttle: number; // 0.0 to 1.0
  thrustN: number;
  fuelFlowRateKgPerSec: number;
  gravityMps2: number;
  airDensityKgPm3: number;
  dragN: number;
  twr: number;

  // Flight Milestones & Scoring
  orbitAchieved: boolean;
  crashed: boolean;
  maxQPassed: boolean;
  mach1Passed: boolean;
  inCorridor: boolean;
  corridorScore: number;
  starsCollected: number;
  shakeIntensity: number;
}

// Physical Constants (SI Units)
export const G0 = 9.80665; // Standard Earth gravitational acceleration (m/s^2)
export const EARTH_RADIUS_M = 6371000; // Mean Earth radius (m)
export const SEA_LEVEL_AIR_DENSITY = 1.225; // Sea-level air density rho_0 (kg/m^3)
export const SCALE_HEIGHT_M = 8500; // Atmospheric scale height H (m)
export const REFERENCE_AREA_M2 = 10.0; // Reference aerodynamic cross-sectional area (m^2)

/**
 * 1. Altitude-dependent Gravitational Acceleration:
 * g(h) = g0 * (R / (R + h))^2
 * Gravity acts toward the planet's centre (downward in local frame).
 */
export function calculateGravity(altitudeM: number): number {
  const alt = Math.max(0, altitudeM);
  return G0 * Math.pow(EARTH_RADIUS_M / (EARTH_RADIUS_M + alt), 2);
}

/**
 * 2. Barometric Atmospheric Density:
 * rho(h) = rho0 * e^(-h / H)
 * Decays exponentially with altitude; reaches 0 in vacuum space (> 100 km Karman line).
 */
export function calculateAirDensity(altitudeM: number): number {
  if (altitudeM < 0) return SEA_LEVEL_AIR_DENSITY;
  if (altitudeM >= 100000) return 0;
  return SEA_LEVEL_AIR_DENSITY * Math.exp(-altitudeM / SCALE_HEIGHT_M);
}

/**
 * 3. Aerodynamic Drag Force Magnitude:
 * F_d = 0.5 * rho * v^2 * Cd * A
 */
export function calculateDragForce(
  velocityMps: number,
  altitudeM: number,
  dragCoeff: number,
  areaM2: number = REFERENCE_AREA_M2
): number {
  const rho = calculateAirDensity(altitudeM);
  return 0.5 * rho * (velocityMps * velocityMps) * dragCoeff * areaM2;
}

/**
 * 4. Aerodynamic Drag Force Vector:
 * F_d_vec = -0.5 * rho(h) * |v| * Cd * A * v_vec
 * Opposes the rocket's true velocity vector relative to the air.
 */
export function calculateDragVector(
  velocity: Vector2D,
  altitudeM: number,
  dragCoeff: number,
  areaM2: number = REFERENCE_AREA_M2
): Vector2D {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (speed < 1e-6) {
    return { x: 0, y: 0 };
  }
  const rho = calculateAirDensity(altitudeM);
  const factor = 0.5 * rho * speed * dragCoeff * areaM2;
  return {
    x: -factor * velocity.x,
    y: -factor * velocity.y,
  };
}

/**
 * 5. Engine Thrust Magnitude:
 * T = Throttle * T_max
 * Clamped to available fuel; if fuel is 0, thrust is 0.
 */
export function calculateThrust(
  throttle: number,
  maxThrustN: number,
  fuelRemainingKg: number
): number {
  if (fuelRemainingKg <= 0) return 0;
  const clampedThrottle = Math.max(0, Math.min(1.0, throttle));
  return clampedThrottle * maxThrustN;
}

/**
 * 6. Thrust Force Vector:
 * Acts along the rocket's orientation angle theta (pitch angle).
 * theta = 0 deg is straight up (+Y), theta = 90 deg is horizontal (+X).
 * T_vec = (T * sin(theta), T * cos(theta))
 */
export function calculateThrustVector(thrustN: number, pitchDeg: number): Vector2D {
  const pitchRad = (pitchDeg * Math.PI) / 180;
  return {
    x: thrustN * Math.sin(pitchRad),
    y: thrustN * Math.cos(pitchRad),
  };
}

/**
 * 7. Fuel Mass Flow Rate:
 * dm_f / dt = -Throttle * m_dot_max
 */
export function calculateFuelFlow(
  throttle: number,
  maxFlowRateKgPerSec: number,
  fuelRemainingKg: number
): number {
  if (fuelRemainingKg <= 0) return 0;
  const clampedThrottle = Math.max(0, Math.min(1.0, throttle));
  return clampedThrottle * maxFlowRateKgPerSec;
}

/**
 * 8. Total Rocket Mass:
 * m = m_dry + m_fuel
 * Decreases only as fuel is consumed.
 */
export function calculateRocketMass(
  capsule: CapsuleSpec,
  tank: TankSpec,
  fuelRemainingKg: number,
  isStageSeparated: boolean = false
): number {
  const fuel = Math.max(0, fuelRemainingKg);
  if (isStageSeparated) {
    // Upper stage: capsule + 35% tank dry structure + remaining Stage 2 fuel
    return capsule.massKg + tank.dryMassKg * 0.35 + fuel;
  }
  return capsule.massKg + tank.dryMassKg + fuel;
}

/**
 * 9. Thrust-To-Weight Ratio (TWR):
 * TWR = Thrust / (m * g(h))
 */
export function calculateTWR(thrustN: number, massKg: number, altitudeM: number): number {
  const g = calculateGravity(altitudeM);
  const weight = massKg * g;
  return weight > 0 ? thrustN / weight : 0;
}

/**
 * 10. Tsiolkovsky Rocket Equation (Delta-V):
 * Delta-V = Isp * g0 * ln(m0 / mf)
 */
export function calculateDeltaV(
  isp: number,
  initialMassKg: number,
  dryMassKg: number
): number {
  if (dryMassKg <= 0 || initialMassKg <= dryMassKg) return 0;
  return isp * G0 * Math.log(initialMassKg / dryMassKg);
}

/**
 * Target gravity turn pitch profile as a function of altitude in meters.
 * Guidance corridor: 2 deg at liftoff -> 20 deg at 10 km -> 55 deg at 50 km -> 85 deg in orbit.
 */
export function getIdealPitch(altitudeM: number): number {
  if (altitudeM < 1500) return 2;
  if (altitudeM < 10000) return 5 + ((altitudeM - 1500) / 8500) * 15;
  if (altitudeM < 50000) return 20 + ((altitudeM - 10000) / 40000) * 35;
  if (altitudeM < 120000) return 55 + ((altitudeM - 50000) / 70000) * 25;
  return 85;
}

/**
 * Continuous Physics Simulation Step:
 *
 * Implements full 2D vector dynamics:
 * F_net = T_vec + F_gravity_vec + F_drag_vec
 * a_vec = F_net / m
 * v_new = v_old + a * dt
 * x_new = x_old + v_new * dt
 */
export function stepRocketSimulationAdvanced(
  tel: FlightTelemetry,
  capsule: CapsuleSpec,
  tank: TankSpec,
  engine: EngineSpec,
  throttle: number, // 0.0 to 1.0
  steerInput: number, // -1 (tilt up/left) to +1 (tilt down/right)
  triggerStaging: boolean,
  dt: number = 0.05
): FlightTelemetry {
  if (tel.crashed || tel.orbitAchieved) {
    return tel;
  }

  // 1. Attitude / Pitch steering dynamics
  let pitchDeg = tel.pitchDeg + steerInput * 24 * dt;
  pitchDeg = Math.max(0, Math.min(88, pitchDeg));

  // 2. Multi-stage separation trigger
  let isStageSeparated = tel.isStageSeparated;
  let shakeIntensity = Math.max(0, tel.shakeIntensity - dt * 4);

  if (triggerStaging && !isStageSeparated && tel.altitudeM > 4000) {
    isStageSeparated = true;
    shakeIntensity = 8.0;
  }

  // 3. Staged Propellant & Engine Thrust
  let s1Fuel = tel.stage1FuelKg;
  let s2Fuel = tel.stage2FuelKg;
  let thrustN = 0;
  let fuelFlowRateKgPerSec = 0;
  let isStage1BurnedOut = tel.isStage1BurnedOut;
  let engineBurnedOut = tel.engineBurnedOut;

  const clampedThrottle = Math.max(0, Math.min(1.0, throttle));

  if (!isStageSeparated) {
    // Stage 1 Boosters Firing
    const s1MaxThrust = engine.thrustKn * 1000;
    const s1MaxFlow = engine.fuelConsumptionRateKgPerSec * 1.05;

    if (s1Fuel > 0 && clampedThrottle > 0) {
      fuelFlowRateKgPerSec = s1MaxFlow * clampedThrottle;
      const fuelNeeded = fuelFlowRateKgPerSec * dt;
      if (s1Fuel >= fuelNeeded) {
        s1Fuel -= fuelNeeded;
        thrustN = s1MaxThrust * clampedThrottle;
      } else {
        const fraction = s1Fuel / fuelNeeded;
        thrustN = s1MaxThrust * clampedThrottle * fraction;
        fuelFlowRateKgPerSec = s1Fuel / dt;
        s1Fuel = 0;
        isStage1BurnedOut = true;
      }
      shakeIntensity = Math.max(shakeIntensity, clampedThrottle * 2.5);
    } else {
      isStage1BurnedOut = true;
    }
  } else {
    // Stage 2 Vacuum Core Firing (Higher vacuum Isp, lower fuel flow)
    const s2MaxThrust = engine.thrustKn * 750;
    const s2MaxFlow = engine.fuelConsumptionRateKgPerSec * 0.4;

    if (s2Fuel > 0 && clampedThrottle > 0) {
      fuelFlowRateKgPerSec = s2MaxFlow * clampedThrottle;
      const fuelNeeded = fuelFlowRateKgPerSec * dt;
      if (s2Fuel >= fuelNeeded) {
        s2Fuel -= fuelNeeded;
        thrustN = s2MaxThrust * clampedThrottle;
      } else {
        const fraction = s2Fuel / fuelNeeded;
        thrustN = s2MaxThrust * clampedThrottle * fraction;
        fuelFlowRateKgPerSec = s2Fuel / dt;
        s2Fuel = 0;
        engineBurnedOut = true;
      }
      shakeIntensity = Math.max(shakeIntensity, clampedThrottle * 1.5);
    } else {
      engineBurnedOut = true;
    }
  }

  // 4. Current Mass & Gravitational Force
  const activeFuel = isStageSeparated ? s2Fuel : (s1Fuel + s2Fuel);
  const currentMass = calculateRocketMass(capsule, tank, activeFuel, isStageSeparated);

  const localG = calculateGravity(tel.altitudeM);
  const weightForce = currentMass * localG; // acts downward along -Y

  // 5. Velocity Vector & Aerodynamic Drag Vector
  const vx = tel.velocityXMps ?? (tel.velocityMps * Math.sin((tel.pitchDeg * Math.PI) / 180));
  const vy = tel.velocityYMps ?? (tel.velocityMps * Math.cos((tel.pitchDeg * Math.PI) / 180));
  const currentSpeed = Math.sqrt(vx * vx + vy * vy);

  const dragCoeff = capsule.dragCoeff;
  const dragArea = isStageSeparated ? 4.5 : REFERENCE_AREA_M2;
  const dragVector = calculateDragVector({ x: vx, y: vy }, tel.altitudeM, dragCoeff, dragArea);
  const dragN = Math.sqrt(dragVector.x * dragVector.x + dragVector.y * dragVector.y);
  const airDensity = calculateAirDensity(tel.altitudeM);

  // Aerodynamic pressure q = 0.5 * rho * v^2
  const qPressurePa = 0.5 * airDensity * (currentSpeed * currentSpeed);
  const maxQPassed = tel.maxQPassed || (tel.altitudeM > 11000 && qPressurePa < 18000);
  const mach1Passed = tel.mach1Passed || (currentSpeed > 343);

  // 6. Thrust Force Vector
  const thrustVector = calculateThrustVector(thrustN, pitchDeg);

  // 7. Net Force Vector: F_net = Thrust + F_gravity + F_drag
  let netFx = thrustVector.x + dragVector.x;
  let netFy = thrustVector.y - weightForce + dragVector.y;

  // Launchpad Support Constraint:
  // When sitting on the ground (altitude <= 0), the ground exerts normal force:
  // If upward thrust does not exceed weight, net vertical force is 0 and rocket remains supported.
  if (tel.altitudeM <= 0 && vy <= 0) {
    if (thrustVector.y <= weightForce) {
      netFy = 0;
      netFx = 0; // Pad launch clamp prevents horizontal drift
    }
  }

  // 8. Acceleration Vector: a = F_net / m
  let vertAccel = netFy / currentMass;
  let horizAccel = netFx / currentMass;

  if (tel.altitudeM <= 0 && vy <= 0 && thrustVector.y <= weightForce) {
    vertAccel = 0;
    horizAccel = 0;
  }

  // 9. Semi-Implicit Euler Numerical Integration
  let newVy = vy + vertAccel * dt;
  let newVx = vx + horizAccel * dt;

  // Ground rest check
  if (tel.altitudeM <= 0 && thrustVector.y <= weightForce && newVy <= 0) {
    newVy = 0;
    newVx = 0;
  }

  let newAltitude = tel.altitudeM + newVy * dt;
  let newHorizontalDist = tel.horizontalDistM + newVx * dt;
  let newSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
  let totalAccel = Math.sqrt(horizAccel * horizAccel + vertAccel * vertAccel);

  // 10. Ground Collision & Landing Check
  let crashed = false;
  if (newAltitude <= 0) {
    newAltitude = 0;
    if (tel.timeSec > 2) {
      // Touchdown evaluation:
      // Safe landing criteria: vertical descent speed <= 12 m/s, horizontal speed <= 8 m/s, pitch <= 18 deg
      if (Math.abs(newVy) > 12 || Math.abs(newVx) > 8 || pitchDeg > 18) {
        crashed = true;
        shakeIntensity = 12.0;
      }
    }
    newVy = 0;
    newVx = 0;
    newSpeed = 0;
  }

  // 11. Orbital Insertion Milestone
  // Reached target LEO: Altitude >= 135 km and total speed >= 7,100 m/s with horizontal vector
  let orbitAchieved = false;
  if (newAltitude >= 135000 && newSpeed >= 7100 && newVx >= 6200) {
    orbitAchieved = true;
    shakeIntensity = 0;
  }

  // 12. Trajectory Corridor Alignment
  const idealPitch = getIdealPitch(newAltitude);
  const pitchError = Math.abs(pitchDeg - idealPitch);
  const inCorridor = pitchError <= 14;
  const corridorBonus = inCorridor ? 20 * dt : 0;

  const twr = calculateTWR(thrustN, currentMass, newAltitude);

  return {
    timeSec: tel.timeSec + dt,
    altitudeM: Math.max(0, newAltitude),
    horizontalDistM: Math.max(0, newHorizontalDist),
    velocityMps: Math.max(0, newSpeed),
    velocityYMps: newVy,
    velocityXMps: newVx,
    accelerationMps2: totalAccel,
    accelerationYMps2: vertAccel,
    accelerationXMps2: horizAccel,
    pitchDeg,
    massKg: currentMass,
    fuelKg: Math.max(0, activeFuel),
    stage1FuelKg: Math.max(0, s1Fuel),
    stage2FuelKg: Math.max(0, s2Fuel),
    isStage1BurnedOut,
    isStageSeparated,
    engineBurnedOut,
    throttle: clampedThrottle,
    thrustN,
    fuelFlowRateKgPerSec,
    gravityMps2: localG,
    airDensityKgPm3: airDensity,
    dragN,
    twr,
    orbitAchieved,
    crashed,
    maxQPassed,
    mach1Passed,
    inCorridor,
    corridorScore: tel.corridorScore + corridorBonus,
    starsCollected: tel.starsCollected,
    shakeIntensity
  };
}
