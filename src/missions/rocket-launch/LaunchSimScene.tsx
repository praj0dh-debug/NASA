import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, ArrowRight, Zap, Sparkles, Flame, ArrowLeft } from 'lucide-react';
import { RocketConfig, FlightTelemetry, stepRocketSimulationAdvanced, getIdealPitch } from './rocketPhysics';
import configData from './config.json';
import { Button } from '../../components/common/Button';
import { soundEffects } from '../../lib/soundEffects';

interface LaunchSimSceneProps {
  config: RocketConfig;
  onComplete: (simScore: number) => void;
  onRestart: () => void;
}

interface StarBeacon {
  id: number;
  altitudeM: number;
  pitchDeg: number;
  collected: boolean;
}

interface SimParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface DetachedBooster {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
}

const MAX_PARTICLES = 60;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export const LaunchSimScene: React.FC<LaunchSimSceneProps> = ({ config, onComplete, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [countdown, setCountdown] = useState<number | null>(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stagingTriggered, setStagingTriggered] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  const capsule = configData.components.capsules.find(c => c.id === config.capsuleId)!;
  const tank = configData.components.tanks.find(t => t.id === config.tankId)!;
  const engine = configData.components.engines.find(e => e.id === config.engineId)!;

  // 8 Collectible Telemetry Star Beacons along optimal gravity turn
  const initialBeacons: StarBeacon[] = [
    { id: 1, altitudeM: 6000, pitchDeg: 10, collected: false },
    { id: 2, altitudeM: 16000, pitchDeg: 24, collected: false },
    { id: 3, altitudeM: 32000, pitchDeg: 40, collected: false },
    { id: 4, altitudeM: 52000, pitchDeg: 55, collected: false },
    { id: 5, altitudeM: 75000, pitchDeg: 66, collected: false },
    { id: 6, altitudeM: 98000, pitchDeg: 74, collected: false },
    { id: 7, altitudeM: 118000, pitchDeg: 80, collected: false },
    { id: 8, altitudeM: 136000, pitchDeg: 85, collected: false },
  ];
  const beaconsRef = useRef<StarBeacon[]>(initialBeacons);

  const initialTelemetry: FlightTelemetry = {
    timeSec: 0,
    altitudeM: 0,
    velocityMps: 0,
    horizontalDistM: 0,
    pitchDeg: 0,
    accelerationMps2: 0,
    stage1FuelKg: tank.fuelKg * 0.65,
    stage2FuelKg: tank.fuelKg * 0.35,
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

  // React state throttled to ~12 Hz to eliminate 60 FPS re-render overhead
  const [telemetry, setTelemetry] = useState<FlightTelemetry>(initialTelemetry);

  // Fast 60 FPS references for physics & render loop
  const telRef = useRef<FlightTelemetry>(initialTelemetry);
  const steerRef = useRef<number>(0);
  const throttleRef = useRef<number>(1.0);
  const stagingRef = useRef<boolean>(false);
  const lastUiUpdateRef = useRef<number>(0);

  // Pre-allocated particle pool to avoid GC pauses during 60 FPS game loop
  const particlePoolRef = useRef<SimParticle[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#F97316',
      size: 6
    }))
  );

  const spawnParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    maxLife: number
  ) => {
    const pool = particlePoolRef.current;
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        pool[i].active = true;
        pool[i].x = x;
        pool[i].y = y;
        pool[i].vx = vx;
        pool[i].vy = vy;
        pool[i].color = color;
        pool[i].size = size;
        pool[i].life = maxLife;
        pool[i].maxLife = maxLife;
        return;
      }
    }
    // Recycle oldest if pool is full
    pool[0].active = true;
    pool[0].x = x;
    pool[0].y = y;
    pool[0].vx = vx;
    pool[0].vy = vy;
    pool[0].color = color;
    pool[0].size = size;
    pool[0].life = maxLife;
    pool[0].maxLife = maxLife;
  };

  const triggerStageSeparation = useCallback(() => {
    if (!telRef.current.isStageSeparated) {
      soundEffects.playStageSeparation();
      setStagingTriggered(true);
      stagingRef.current = true;
    }
  }, []);

  // Direct keyboard steering handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSimulating || isFinished) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        steerRef.current = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        steerRef.current = 1;
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (telRef.current.isStage1BurnedOut && !telRef.current.isStageSeparated) {
          triggerStageSeparation();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'a' ||
        e.key === 'A' ||
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'D'
      ) {
        steerRef.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSimulating, isFinished, triggerStageSeparation]);

  // Launch countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown !== null) {
      if (countdown > 0) {
        soundEffects.playBeep(false);
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        soundEffects.playBeep(true);
        soundEffects.playRocketThrust(2.5);
        setCountdown(null);
        setIsSimulating(true);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // In-flight Reset ("Fly Again")
  const handleFlyAgain = () => {
    const freshTel: FlightTelemetry = {
      ...initialTelemetry,
      stage1FuelKg: tank.fuelKg * 0.65,
      stage2FuelKg: tank.fuelKg * 0.35,
    };
    telRef.current = freshTel;
    setTelemetry(freshTel);
    beaconsRef.current = initialBeacons.map(b => ({ ...b, collected: false }));
    setScoreStars(0);
    setStagingTriggered(false);
    stagingRef.current = false;
    steerRef.current = 0;
    throttleRef.current = 1.0;
    setIsFinished(false);
    setSuccess(false);
    setCountdown(3);
    setIsSimulating(false);
    // Clear particles
    for (const p of particlePoolRef.current) {
      p.active = false;
    }
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (!isSimulating || isFinished) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Detached booster parts tracking
    const boosters: DetachedBooster[] = [];
    let shockwaveRadius = 0;
    let shockwaveActive = false;
    let lastMach1State = false;
    let prevStageSeparated = false;

    // Fixed star positions for cosmic background
    const stars = Array.from({ length: 90 }, (_, i) => ({
      x: ((Math.sin(i * 123) * 0.5 + 0.5) * CANVAS_WIDTH),
      y: ((Math.cos(i * 87) * 0.5 + 0.5) * (CANVAS_HEIGHT * 0.7)),
      r: i % 5 === 0 ? 1.8 : 1.0
    }));

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.06);
      lastTime = now;

      // Physics substepping (4 sub-ticks per frame for rock-solid stability)
      let currentTel = telRef.current;
      const substeps = 4;
      const subDt = dt / substeps;
      for (let s = 0; s < substeps; s++) {
        currentTel = stepRocketSimulationAdvanced(
          currentTel,
          capsule,
          tank,
          engine,
          throttleRef.current,
          steerRef.current,
          stagingRef.current,
          subDt
        );
      }
      telRef.current = currentTel;

      // Spawn detaching side boosters when staged
      if (currentTel.isStageSeparated && !prevStageSeparated) {
        prevStageSeparated = true;
        boosters.push(
          { x: -18, y: 15, vx: -45, vy: 25, rot: 0, vRot: -0.15 },
          { x: 18, y: 15, vx: 45, vy: 25, rot: 0, vRot: 0.15 }
        );
      }

      // Sonic Boom triggering
      if (currentTel.mach1Passed && !lastMach1State) {
        lastMach1State = true;
        shockwaveActive = true;
        shockwaveRadius = 15;
        soundEffects.playSonicBoom();
      }

      // Collectible Star Beacons Check
      const beacons = beaconsRef.current;
      for (let i = 0; i < beacons.length; i++) {
        const b = beacons[i];
        if (!b.collected && Math.abs(currentTel.altitudeM - b.altitudeM) < 6500) {
          if (Math.abs(currentTel.pitchDeg - b.pitchDeg) < 15) {
            b.collected = true;
            currentTel.starsCollected += 1;
            setScoreStars(currentTel.starsCollected);
            soundEffects.playStarPickup();
          }
        }
      }

      // Throttle React UI state updates to ~12 Hz to eliminate 60 FPS re-render stutter
      if (now - lastUiUpdateRef.current > 80) {
        lastUiUpdateRef.current = now;
        setTelemetry({ ...currentTel });
      }

      // Check Terminal Simulation Outcomes
      if (currentTel.orbitAchieved) {
        setIsSimulating(false);
        setIsFinished(true);
        setSuccess(true);
        setTelemetry({ ...currentTel });
        soundEffects.playSuccess();
        return;
      }

      if (
        currentTel.crashed ||
        (currentTel.engineBurnedOut && currentTel.altitudeM < 2000 && currentTel.velocityMps < 0)
      ) {
        setIsSimulating(false);
        setIsFinished(true);
        setSuccess(false);
        setTelemetry({ ...currentTel });
        soundEffects.playWarning();
        return;
      }

      // Canvas Rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = CANVAS_WIDTH;
          const h = CANVAS_HEIGHT;

          ctx.save();

          // Screen shake
          if (currentTel.shakeIntensity > 0.1) {
            const sx = (Math.random() - 0.5) * currentTel.shakeIntensity;
            const sy = (Math.random() - 0.5) * currentTel.shakeIntensity;
            ctx.translate(sx, sy);
          }

          // Dynamic Sky Gradient based on altitude
          const altNorm = Math.min(1.0, currentTel.altitudeM / 140000);
          const skyGrad = ctx.createLinearGradient(0, 0, 0, h);

          if (altNorm < 0.2) {
            // Troposphere (0 - 28 km): Florida blue sky into upper stratosphere
            skyGrad.addColorStop(0, '#1E3A8A');
            skyGrad.addColorStop(0.5, '#2563EB');
            skyGrad.addColorStop(1, '#38BDF8');
          } else if (altNorm < 0.55) {
            // Stratosphere to Mesosphere (28 - 77 km): Deep space indigo & purple
            skyGrad.addColorStop(0, '#0a0b2e');
            skyGrad.addColorStop(0.5, '#16124a');
            skyGrad.addColorStop(1, '#2e336d');
          } else {
            // Orbital Vacuum (> 77 km): Cosmic black void
            skyGrad.addColorStop(0, '#030511');
            skyGrad.addColorStop(0.6, '#080a21');
            skyGrad.addColorStop(1, '#0e1030');
          }
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, h);

          // Starfield in upper atmosphere and space
          if (altNorm > 0.18) {
            const starAlpha = Math.min(1.0, (altNorm - 0.18) * 3);
            ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
            for (const s of stars) {
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Camera & Rocket Positioning
          // Pad position: h - 145. In flight: climbs smoothly to h * 0.46 (centered)
          const climbRatio = Math.min(1.0, currentTel.altitudeM / 4000);
          const rocketScreenY = (h - 145) * (1 - climbRatio) + (h * 0.46) * climbRatio;

          // Horizontal position shifts dynamically with gravity turn pitch
          const pitchRad = (currentTel.pitchDeg * Math.PI) / 180;
          const maxLateralOffset = w * 0.22;
          const rocketScreenX = (w * 0.42) + Math.sin(pitchRad) * maxLateralOffset;

          // Atmospheric Layers & Ground Scrolling
          if (altNorm > 0.4) {
            // Curved Earth Horizon at high altitude
            const earthCenterY = h * 0.78 + (1 - altNorm) * 220;
            ctx.beginPath();
            ctx.arc(w / 2, earthCenterY + 880, 920, Math.PI * 1.15, Math.PI * 1.85);
            ctx.fillStyle = '#0284C7';
            ctx.fill();

            // Luminous atmospheric limb
            ctx.lineWidth = 14;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.stroke();

            // Cloud whorl details on Earth
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.ellipse(w * 0.42, earthCenterY + 12, 75, 18, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Earth surface & Launch Pad 39B at Cape Canaveral
            // Ground scrolls down as altitude increases
            const groundY = (rocketScreenY + 60) + (currentTel.altitudeM * 0.08);
            if (groundY < h + 180) {
              // Ocean blue water
              ctx.fillStyle = '#0284C7';
              ctx.fillRect(0, groundY + 12, w, Math.max(0, h - groundY));

              // Green Cape Canaveral terrain
              ctx.fillStyle = '#15803D';
              ctx.fillRect(0, groundY, w, 16);

              // Launch Pad Gantry Tower
              const padX = (w * 0.42) - 80;
              ctx.fillStyle = '#334155';
              ctx.fillRect(padX, groundY - 110, 22, 110);
              // Red Access Arm
              ctx.fillStyle = '#DC2626';
              ctx.fillRect(padX, groundY - 80, 48, 8);
              // Launch base concrete mount
              ctx.fillStyle = '#64748B';
              ctx.fillRect((w * 0.42) - 30, groundY - 6, 60, 10);
            }

            // High-speed tropospheric clouds (0.8 km - 14 km)
            if (currentTel.altitudeM > 800 && currentTel.altitudeM < 18000) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
              const cloudY1 = ((currentTel.altitudeM * 0.3) % (h * 1.5)) - 80;
              const cloudY2 = (((currentTel.altitudeM * 0.45) + 200) % (h * 1.5)) - 80;

              ctx.beginPath();
              ctx.ellipse(w * 0.25, cloudY1, 140, 30, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.beginPath();
              ctx.ellipse(w * 0.72, cloudY2, 180, 36, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Trajectory Guidance Corridor Target
          const idealPitch = getIdealPitch(currentTel.altitudeM);
          const idealRad = (idealPitch * Math.PI) / 180;
          const pitchError = Math.abs(currentTel.pitchDeg - idealPitch);

          // Corridor target reticle is placed 125px forward along the ideal pitch angle
          const corridorDist = 125;
          const corridorX = rocketScreenX + Math.sin(idealRad) * corridorDist;
          const corridorY = rocketScreenY - Math.cos(idealRad) * corridorDist;

          // Flight Path Guideline (projected from rocket nose towards corridor gate)
          ctx.strokeStyle = currentTel.inCorridor ? 'rgba(74, 222, 128, 0.35)' : 'rgba(248, 113, 113, 0.3)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(rocketScreenX, rocketScreenY - 35);
          ctx.lineTo(corridorX, corridorY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Corridor Gate Reticle
          ctx.save();
          ctx.translate(corridorX, corridorY);
          ctx.rotate(idealRad);

          // Outer dashed circle
          ctx.strokeStyle = currentTel.inCorridor ? 'rgba(74, 222, 128, 0.85)' : 'rgba(248, 113, 113, 0.75)';
          ctx.lineWidth = currentTel.inCorridor ? 3 : 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, 36, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Gate inner glow
          ctx.fillStyle = currentTel.inCorridor ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.08)';
          ctx.fill();

          // Reticle Crosshair Ticks
          ctx.strokeStyle = currentTel.inCorridor ? '#4ADE80' : '#F87171';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-42, 0); ctx.lineTo(-30, 0);
          ctx.moveTo(30, 0); ctx.lineTo(42, 0);
          ctx.moveTo(0, -42); ctx.lineTo(0, -30);
          ctx.moveTo(0, 30); ctx.lineTo(0, 42);
          ctx.stroke();

          ctx.restore();

          // Corridor Status Text & Steering Prompt
          ctx.font = 'bold 11px monospace';
          if (currentTel.inCorridor) {
            ctx.fillStyle = '#4ADE80';
            ctx.fillText('✓ TRAJECTORY LOCKED', corridorX - 58, corridorY - 45);
          } else {
            ctx.fillStyle = '#F87171';
            const cue = currentTel.pitchDeg > idealPitch ? '⮪ PITCH UP [A]' : 'PITCH RIGHT [D] ⮫';
            ctx.fillText(cue, corridorX - 44, corridorY - 45);
          }

          // Star Beacons (Descending smoothly towards the corridor gate)
          for (const b of beacons) {
            if (!b.collected && Math.abs(currentTel.altitudeM - b.altitudeM) < 22000) {
              const altDiff = b.altitudeM - currentTel.altitudeM;
              const beaconProg = altDiff / 22000;
              const bRad = (b.pitchDeg * Math.PI) / 180;
              const bDist = corridorDist + (beaconProg * 140);
              const bX = rocketScreenX + Math.sin(bRad) * bDist;
              const bY = rocketScreenY - Math.cos(bRad) * bDist;

              ctx.fillStyle = '#FBBF24';
              ctx.beginPath();
              ctx.arc(bX, bY, 10, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.font = 'bold 12px sans-serif';
              ctx.fillText('⭐', bX - 7, bY + 4);
            }
          }

          // Sonic Boom Condensation Cone / Shockwave
          if (shockwaveActive) {
            shockwaveRadius += dt * 360;
            const shockAlpha = Math.max(0, 1 - shockwaveRadius / 160);
            ctx.strokeStyle = `rgba(255, 255, 255, ${shockAlpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(rocketScreenX, rocketScreenY, shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            if (shockwaveRadius > 160) shockwaveActive = false;
          }

          // Exhaust Fire & Smoke Plume
          const hasFuel = (currentTel.isStageSeparated ? currentTel.stage2FuelKg : currentTel.stage1FuelKg) > 0;
          if (currentTel.thrustN > 0 && hasFuel) {
            const spawnCount = currentTel.isStageSeparated ? 2 : 4;
            const isUpper = currentTel.isStageSeparated;
            const exhaustCos = Math.cos(pitchRad);
            const exhaustSin = Math.sin(pitchRad);

            for (let p = 0; p < spawnCount; p++) {
              const nozzleOffset = 32;
              const px = rocketScreenX - exhaustSin * nozzleOffset + (Math.random() - 0.5) * (isUpper ? 6 : 12);
              const py = rocketScreenY + exhaustCos * nozzleOffset + (Math.random() - 0.5) * 4;

              const speed = Math.random() * 12 + 10;
              const pvx = -exhaustSin * speed + (Math.random() - 0.5) * 6;
              const pvy = exhaustCos * speed + (Math.random() - 0.5) * 4;

              const pColor = isUpper
                ? Math.random() > 0.4 ? '#38BDF8' : '#818CF8'
                : Math.random() > 0.35 ? '#F97316' : '#FBBF24';

              spawnParticle(px, py, pvx, pvy, pColor, Math.random() * 7 + 4, 0.7);
            }
          }

          // Update & Draw Particles from pool
          const pool = particlePoolRef.current;
          for (let i = 0; i < pool.length; i++) {
            const p = pool[i];
            if (p.active) {
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.life -= dt;
              p.size *= 0.96;

              if (p.life <= 0) {
                p.active = false;
              } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // Detached Boosters Rendering
          for (const b of boosters) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.rot += b.vRot;

            ctx.save();
            ctx.translate(rocketScreenX + b.x, rocketScreenY + b.y);
            ctx.rotate(b.rot);
            ctx.fillStyle = '#64748B';
            ctx.fillRect(-4, -14, 8, 28);
            // Booster nose
            ctx.fillStyle = '#E2E8F0';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(4, -14);
            ctx.lineTo(-4, -14);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Main Artemis Rocket Body
          ctx.save();
          ctx.translate(rocketScreenX, rocketScreenY);
          ctx.rotate(pitchRad);

          // Corridor alignment halo
          if (currentTel.inCorridor) {
            ctx.shadowColor = '#4ADE80';
            ctx.shadowBlur = 14;
          }

          // Capsule Nosecone (Orion / Science core)
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.moveTo(0, -40);
          ctx.lineTo(10, -14);
          ctx.lineTo(-10, -14);
          ctx.closePath();
          ctx.fill();

          // Capsule Window & Rim
          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Main Core Tank
          ctx.fillStyle = currentTel.isStageSeparated ? '#94A3B8' : '#EA580C';
          ctx.fillRect(-10, -14, 20, 40);

          // NASA Worm / Artemis Decal Ring
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-10, 0, 20, 5);

          // Strapped Side Boosters (Stage 1)
          if (!currentTel.isStageSeparated) {
            ctx.fillStyle = '#E2E8F0';
            // Left booster
            ctx.fillRect(-17, -8, 6, 38);
            ctx.beginPath();
            ctx.moveTo(-14, -16);
            ctx.lineTo(-11, -8);
            ctx.lineTo(-17, -8);
            ctx.closePath();
            ctx.fill();

            // Right booster
            ctx.fillRect(11, -8, 6, 38);
            ctx.beginPath();
            ctx.moveTo(14, -16);
            ctx.lineTo(17, -8);
            ctx.lineTo(11, -8);
            ctx.closePath();
            ctx.fill();
          }

          // Delta Fins
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(-10, 16);
          ctx.lineTo(-19, 28);
          ctx.lineTo(-10, 26);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(10, 16);
          ctx.lineTo(19, 28);
          ctx.lineTo(10, 26);
          ctx.closePath();
          ctx.fill();

          // Engine Bell Nozzle
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.moveTo(-7, 26);
          ctx.lineTo(7, 26);
          ctx.lineTo(11, 34);
          ctx.lineTo(-11, 34);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulating, isFinished, capsule, tank, engine]);

  const handleFinishDebrief = () => {
    const altRatio = Math.min(1.0, telemetry.altitudeM / 140000);
    const velRatio = Math.min(1.0, telemetry.velocityMps / 7200);
    const corridorScoreRatio = Math.min(1.0, telemetry.corridorScore / 300);
    const starScore = (telemetry.starsCollected || scoreStars) * 10;

    const finalSimScore = Math.round(altRatio * 35 + velRatio * 35 + corridorScoreRatio * 20 + starScore);
    onComplete(Math.max(40, Math.min(100, finalSimScore)));
  };

  const s1Percent = (telemetry.stage1FuelKg / (tank.fuelKg * 0.65)) * 100;
  const s2Percent = (telemetry.stage2FuelKg / (tank.fuelKg * 0.35)) * 100;

  return (
    <div className="bg-[#12153f]/90 border border-[#2e336d]/70 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-6 animate-fadeIn">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2e336d]/60">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-amber-400" />
            LIVE FLIGHT DECK — ACTIVE STEERING CONTROLS
          </span>
          <h3 className="text-lg font-black text-white font-display">
            Artemis Launch Vehicle Flight Guidance
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stars: {scoreStars || telemetry.starsCollected} / 8</span>
          </div>

          {telemetry.altitudeM > 100000 && (
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded-full text-xs font-bold font-mono">
              KARMAN LINE REACHED (SPACE)
            </span>
          )}
        </div>
      </div>

      {/* Viewport and Flight Instrument Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 relative w-full aspect-[16/10] max-h-[480px] rounded-3xl overflow-hidden border-2 border-slate-700/80 bg-space-950 shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain block"
          />

          {/* On-Screen Steering & Staging Controls (Direct Arcade Buttons) */}
          {isSimulating && !isFinished && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto gap-2">
              {/* Steer Left Button */}
              <button
                onMouseDown={() => { steerRef.current = -1; }}
                onMouseUp={() => { steerRef.current = 0; }}
                onTouchStart={() => { steerRef.current = -1; }}
                onTouchEnd={() => { steerRef.current = 0; }}
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-space-900/90 hover:bg-space-800 text-sky-400 rounded-2xl border border-sky-500/40 active:scale-95 transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 font-mono text-xs font-bold select-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">PITCH UP [A]</span>
              </button>

              {/* Stage Separation Button (Flashes when Stage 1 is burned out) */}
              {telemetry.isStage1BurnedOut && !telemetry.isStageSeparated ? (
                <button
                  onClick={triggerStageSeparation}
                  className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-2xl border-2 border-yellow-300 animate-bounce shadow-xl flex items-center gap-2 select-none cursor-pointer text-xs sm:text-sm"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>DETACH BOOSTERS (SPACE)</span>
                </button>
              ) : (
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-300 bg-black/70 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-700/80 text-center">
                  Use <span className="text-amber-300 font-bold">[A]</span> / <span className="text-amber-300 font-bold">[D]</span> or Arrow Keys to steer into green corridor
                </div>
              )}

              {/* Steer Right Button */}
              <button
                onMouseDown={() => { steerRef.current = 1; }}
                onMouseUp={() => { steerRef.current = 0; }}
                onTouchStart={() => { steerRef.current = 1; }}
                onTouchEnd={() => { steerRef.current = 0; }}
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-space-900/90 hover:bg-space-800 text-sky-400 rounded-2xl border border-sky-500/40 active:scale-95 transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 font-mono text-xs font-bold select-none cursor-pointer"
              >
                <span className="hidden sm:inline">PITCH RIGHT [D]</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white backdrop-blur-sm z-20">
              <div className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">
                MAIN PROPULSION T-MINUS
              </div>
              <div className="text-7xl sm:text-8xl font-black font-display text-amber-400 animate-ping">
                {countdown === 0 ? 'LIFTOFF' : countdown}
              </div>
              <p className="text-xs text-slate-300 mt-4">Steer with [A] and [D] into the green corridor ring!</p>
            </div>
          )}

          {/* End Simulation Modal Overlay */}
          {isFinished && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              {success ? (
                <div className="space-y-4 max-w-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
                    ⭐
                  </div>
                  <h4 className="text-2xl font-black text-white font-display">
                    ORBITAL INSERTION ACHIEVED!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cadet reached {(telemetry.altitudeM / 1000).toFixed(0)} km apogee at {telemetry.velocityMps.toFixed(0)} m/s! You gathered {scoreStars || telemetry.starsCollected} telemetry stars and maintained flight path alignment.
                  </p>
                  <Button
                    onClick={handleFinishDebrief}
                    variant="bean"
                    size="lg"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Proceed to Scientific Debrief
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
                    🪂
                  </div>
                  <h4 className="text-2xl font-black text-white font-display">
                    SUB-ORBITAL OCEAN SPLASHDOWN
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The capsule deployed parachutes and splashed down safely! Altitude reached: {(telemetry.altitudeM / 1000).toFixed(0)} km. Steer into the green corridor reticle and separate Stage 1 boosters when empty to reach orbit!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleFlyAgain} variant="bean" icon={<RotateCcw className="w-4 h-4" />}>
                      Fly Again
                    </Button>
                    <Button onClick={onRestart} variant="secondary">
                      Change Booster Build
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-Time Flight Gauges (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e1030]/90 border border-[#2e336d]/70 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>Flight Telemetry</span>
              <span className={`text-[11px] font-bold ${telemetry.inCorridor ? 'text-emerald-400' : 'text-rose-400'}`}>
                {telemetry.inCorridor ? '✓ On Corridor' : '⚠ Off Corridor'}
              </span>
            </h4>

            {/* Altitude Gauge */}
            <div className="p-3 bg-[#0a0b2e]/90 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>ALTITUDE</span>
                <span className="text-sky-300 font-bold">ORBIT: 140 km</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {(telemetry.altitudeM / 1000).toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-sky-400 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (telemetry.altitudeM / 140000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Velocity & Mach Number */}
            <div className="p-3 bg-[#0a0b2e]/90 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>VELOCITY</span>
                <span className="text-emerald-400 font-bold">
                  Mach {(telemetry.velocityMps / 343).toFixed(1)}
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {(telemetry.velocityMps / 1000).toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">km/s</span>
              </div>
            </div>

            {/* Pitch Angle Indicator */}
            <div className="p-3 bg-[#0a0b2e]/90 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>PITCH ANGLE</span>
                <span className="text-sky-400 font-bold">IDEAL: {getIdealPitch(telemetry.altitudeM).toFixed(0)}°</span>
              </div>
              <div className="text-xl font-black font-mono text-white">
                {telemetry.pitchDeg.toFixed(0)}°
              </div>
            </div>

            {/* Multi-Stage Propellant Display */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>STAGE 1 BOOSTERS</span>
                  <span className={`font-bold ${s1Percent > 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {telemetry.isStageSeparated ? 'JETTISONED' : `${s1Percent.toFixed(0)}%`}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      telemetry.isStageSeparated ? 'bg-slate-600' : s1Percent > 10 ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.max(0, s1Percent)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>STAGE 2 VACUUM CORE</span>
                  <span className="text-cyan-400 font-bold">{s2Percent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all"
                    style={{ width: `${Math.max(0, s2Percent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={onRestart}
            className="w-full"
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Abort & Re-design
          </Button>
        </div>
      </div>
    </div>
  );
};
