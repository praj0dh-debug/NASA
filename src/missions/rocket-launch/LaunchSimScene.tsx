import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, ArrowRight, Award, Compass, Zap, Sparkles, Flame, ShieldAlert, ArrowLeft } from 'lucide-react';
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

export const LaunchSimScene: React.FC<LaunchSimSceneProps> = ({ config, onComplete, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [countdown, setCountdown] = useState<number | null>(3);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [success, setSuccess] = useState(false);
  const [throttle, setThrottle] = useState(1.0); // 0 to 1
  const [steerInput, setSteerInput] = useState(0); // -1 to 1
  const [stagingTriggered, setStagingTriggered] = useState(false);
  const [scoreStars, setScoreStars] = useState(0);

  const capsule = configData.components.capsules.find(c => c.id === config.capsuleId)!;
  const tank = configData.components.tanks.find(t => t.id === config.tankId)!;
  const engine = configData.components.engines.find(e => e.id === config.engineId)!;

  // Generate 8 collectible telemetry star beacons along the optimal gravity turn
  const [beacons, setBeacons] = useState<StarBeacon[]>([
    { id: 1, altitudeM: 8000, pitchDeg: 12, collected: false },
    { id: 2, altitudeM: 18000, pitchDeg: 25, collected: false },
    { id: 3, altitudeM: 35000, pitchDeg: 42, collected: false },
    { id: 4, altitudeM: 55000, pitchDeg: 58, collected: false },
    { id: 5, altitudeM: 80000, pitchDeg: 68, collected: false },
    { id: 6, altitudeM: 105000, pitchDeg: 76, collected: false },
    { id: 7, altitudeM: 125000, pitchDeg: 82, collected: false },
    { id: 8, altitudeM: 140000, pitchDeg: 86, collected: false },
  ]);

  const [telemetry, setTelemetry] = useState<FlightTelemetry>({
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
  });

  const telRef = useRef(telemetry);
  telRef.current = telemetry;

  const steerRef = useRef(steerInput);
  steerRef.current = steerInput;

  const throttleRef = useRef(throttle);
  throttleRef.current = throttle;

  const stagingRef = useRef(stagingTriggered);
  stagingRef.current = stagingTriggered;

  // Keyboard Event Listeners for direct arcade steering
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSimulating || isFinished) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSteerInput(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSteerInput(1);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        // If stage 1 is burned out, Space triggers staging!
        if (telRef.current.isStage1BurnedOut && !telRef.current.isStageSeparated) {
          triggerStageSeparation();
        } else {
          setThrottle(1.0);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSteerInput(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSimulating, isFinished]);

  const triggerStageSeparation = () => {
    if (!telRef.current.isStageSeparated) {
      soundEffects.playStageSeparation();
      setStagingTriggered(true);
    }
  };

  // Countdown timer
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

  // Main 60FPS Game Loop
  useEffect(() => {
    if (!isSimulating || isFinished) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Particle pool
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }> = [];

    // Detached booster animation parts
    const boosters: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vRot: number;
    }> = [];

    let shockwaveRadius = 0;
    let shockwaveActive = false;
    let lastMach1State = false;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Physics integration step
      let currentTel = telRef.current;
      const substeps = 4;
      for (let s = 0; s < substeps; s++) {
        currentTel = stepRocketSimulationAdvanced(
          currentTel,
          capsule,
          tank,
          engine,
          throttleRef.current,
          steerRef.current,
          stagingRef.current,
          dt / substeps
        );
      }

      // If staging just occurred, spawn detaching boosters
      if (currentTel.isStageSeparated && !telRef.current.isStageSeparated) {
        boosters.push(
          { x: -16, y: 15, vx: -35, vy: 15, rot: 0, vRot: -0.1 },
          { x: 16, y: 15, vx: 35, vy: 15, rot: 0, vRot: 0.1 }
        );
      }

      // Sonic Boom detection
      if (currentTel.mach1Passed && !lastMach1State) {
        lastMach1State = true;
        shockwaveActive = true;
        shockwaveRadius = 10;
        soundEffects.playSonicBoom();
      }

      // Check star beacon collection
      beacons.forEach(b => {
        if (!b.collected && Math.abs(currentTel.altitudeM - b.altitudeM) < 6000) {
          if (Math.abs(currentTel.pitchDeg - b.pitchDeg) < 16) {
            b.collected = true;
            currentTel.starsCollected += 1;
            soundEffects.playStarPickup();
          }
        }
      });

      setTelemetry({ ...currentTel });

      // Check win/lose
      if (currentTel.orbitAchieved) {
        setIsSimulating(false);
        setIsFinished(true);
        setSuccess(true);
        soundEffects.playSuccess();
        return;
      }

      if (currentTel.crashed || (currentTel.engineBurnedOut && currentTel.altitudeM < 2000 && currentTel.velocityMps < 0)) {
        setIsSimulating(false);
        setIsFinished(true);
        setSuccess(false);
        soundEffects.playWarning();
        return;
      }

      // Canvas Rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Screen Shake translation
          ctx.save();
          if (currentTel.shakeIntensity > 0.1) {
            const sx = (Math.random() - 0.5) * currentTel.shakeIntensity;
            const sy = (Math.random() - 0.5) * currentTel.shakeIntensity;
            ctx.translate(sx, sy);
          }

          // Dynamic Sky Background based on altitude
          const altNorm = Math.min(1.0, currentTel.altitudeM / 140000);
          let skyGrad = ctx.createLinearGradient(0, 0, 0, h);

          if (altNorm < 0.25) {
            // Lower atmosphere: Florida morning sky
            skyGrad.addColorStop(0, '#1E40AF');
            skyGrad.addColorStop(0.6, '#38BDF8');
            skyGrad.addColorStop(1, '#BAE6FD');
          } else if (altNorm < 0.65) {
            // Stratosphere: Deep twilight purple/midnight
            skyGrad.addColorStop(0, '#030712');
            skyGrad.addColorStop(0.5, '#1E1B4B');
            skyGrad.addColorStop(1, '#4338CA');
          } else {
            // Outer Space: Inky blackness with nebular glow
            skyGrad.addColorStop(0, '#020617');
            skyGrad.addColorStop(0.7, '#0B0F2A');
            skyGrad.addColorStop(1, '#020617');
          }
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, h);

          // Starfield in vacuum space
          if (altNorm > 0.2) {
            const numStars = Math.floor(altNorm * 90);
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < numStars; i++) {
              const starX = ((Math.sin(i * 123) * 0.5 + 0.5) * w);
              const starY = ((Math.cos(i * 87) * 0.5 + 0.5) * (h * 0.75));
              const r = (i % 4 === 0) ? 1.8 : 1.0;
              ctx.beginPath();
              ctx.arc(starX, starY, r, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Curved Earth Horizon at high altitude
          if (altNorm > 0.35) {
            const earthCenterY = h * 0.8 + (1 - altNorm) * 220;
            ctx.beginPath();
            ctx.arc(w / 2, earthCenterY + 900, 940, Math.PI * 1.15, Math.PI * 1.85);
            ctx.fillStyle = '#0284C7';
            ctx.fill();

            // Atmospheric luminous limb
            ctx.lineWidth = 14;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
            ctx.stroke();

            // Cloud whorls on Earth
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(w * 0.45, earthCenterY + 10, 80, 20, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Earth surface & Launch Pad 39B at Cape Canaveral
            const groundY = h - 60 + (currentTel.altitudeM / 25);
            if (groundY < h + 150) {
              // Ocean blue water & green launch pad terrain
              ctx.fillStyle = '#0369A1';
              ctx.fillRect(0, groundY + 15, w, h - groundY);

              ctx.fillStyle = '#166534';
              ctx.fillRect(0, groundY, w, 20);

              // Launch Pad Gantry Tower
              const padX = w / 2 - 80;
              ctx.fillStyle = '#475569';
              ctx.fillRect(padX, groundY - 110, 24, 110);
              ctx.fillStyle = '#DC2626';
              ctx.fillRect(padX, groundY - 80, 45, 8); // Red access arm
            }
          }

          // Draw Optimal Trajectory Corridor (Green visual guidance tunnel)
          const idealPitch = getIdealPitch(currentTel.altitudeM);
          const corridorX = w / 2 + Math.sin((idealPitch * Math.PI) / 180) * 120;
          const corridorY = h * 0.45;

          // Corridor HUD indicator
          ctx.strokeStyle = currentTel.inCorridor ? 'rgba(74, 222, 128, 0.7)' : 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(corridorX, corridorY, 45, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = currentTel.inCorridor ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.1)';
          ctx.fill();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = currentTel.inCorridor ? '#4ADE80' : '#F87171';
          ctx.fillText(currentTel.inCorridor ? 'CORRIDOR LOCKED' : 'ALIGN TRAJECTORY', corridorX - 45, corridorY - 52);

          // Draw Collectible Star Beacons
          beacons.forEach(b => {
            if (!b.collected && Math.abs(currentTel.altitudeM - b.altitudeM) < 25000) {
              const bY = corridorY - ((b.altitudeM - currentTel.altitudeM) / 300);
              const bX = w / 2 + Math.sin((b.pitchDeg * Math.PI) / 180) * 120;
              ctx.fillStyle = '#FBBF24';
              ctx.beginPath();
              ctx.arc(bX, bY, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2;
              ctx.stroke();

              ctx.font = 'bold 11px sans-serif';
              ctx.fillText('⭐', bX - 7, bY + 4);
            }
          });

          // Sonic Boom Shockwave Ring animation
          if (shockwaveActive) {
            shockwaveRadius += dt * 380;
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - shockwaveRadius / 150)})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.5, shockwaveRadius, 0, Math.PI * 2);
            ctx.stroke();

            if (shockwaveRadius > 150) shockwaveActive = false;
          }

          // Draw Exhaust Fire & Smoke Plumes
          const rocketScreenX = w / 2;
          const rocketScreenY = Math.max(h * 0.42, h - 110 - (currentTel.altitudeM / 400));
          const hasFuel = (currentTel.isStageSeparated ? currentTel.stage2FuelKg : currentTel.stage1FuelKg) > 0;

          if (currentTel.thrustN > 0 && hasFuel) {
            for (let p = 0; p < (currentTel.isStageSeparated ? 3 : 6); p++) {
              particles.push({
                x: rocketScreenX + (Math.random() - 0.5) * (currentTel.isStageSeparated ? 6 : 14),
                y: rocketScreenY + 28,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 12 + 8,
                life: 1.0,
                color: currentTel.isStageSeparated
                  ? (Math.random() > 0.4 ? '#38BDF8' : '#818CF8') // High-efficiency blue/purple plasma
                  : (Math.random() > 0.35 ? '#F97316' : '#FBBF24'), // Kerolox orange fire
                size: Math.random() * 8 + 5
              });
            }
          }

          // Update & draw particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * 2.2;
            p.size *= 0.95;

            if (p.life <= 0) {
              particles.splice(i, 1);
            } else {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Detached Boosters animation
          for (let b of boosters) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.rot += b.vRot;

            ctx.save();
            ctx.translate(rocketScreenX + b.x, rocketScreenY + b.y);
            ctx.rotate(b.rot);
            ctx.fillStyle = '#64748B';
            ctx.fillRect(-4, -12, 8, 24);
            ctx.restore();
          }

          // Rocket Body Render
          ctx.save();
          ctx.translate(rocketScreenX, rocketScreenY);
          ctx.rotate((currentTel.pitchDeg * Math.PI) / 180);

          // Green aura if inside optimal corridor
          if (currentTel.inCorridor) {
            ctx.shadowColor = '#4ADE80';
            ctx.shadowBlur = 15;
          }

          // Capsule Nosecone (Orion / Science core)
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.moveTo(0, -38);
          ctx.lineTo(10, -14);
          ctx.lineTo(-10, -14);
          ctx.closePath();
          ctx.fill();

          // Capsule Heatshield rim & Window
          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(0, -22, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Main Core Tank
          ctx.fillStyle = currentTel.isStageSeparated ? '#94A3B8' : '#EA580C';
          ctx.fillRect(-10, -14, 20, 38);

          // NASA Worm / Artemis Decal
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-10, 0, 20, 5);

          // Strapped Side Boosters (only if not yet separated)
          if (!currentTel.isStageSeparated) {
            ctx.fillStyle = '#E2E8F0';
            // Left booster
            ctx.fillRect(-17, -8, 6, 36);
            ctx.beginPath();
            ctx.moveTo(-14, -16);
            ctx.lineTo(-11, -8);
            ctx.lineTo(-17, -8);
            ctx.closePath();
            ctx.fill();

            // Right booster
            ctx.fillRect(11, -8, 6, 36);
            ctx.beginPath();
            ctx.moveTo(14, -16);
            ctx.lineTo(17, -8);
            ctx.lineTo(11, -8);
            ctx.closePath();
            ctx.fill();
          }

          // Aerodynamic Delta Fins
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(-10, 14);
          ctx.lineTo(-18, 26);
          ctx.lineTo(-10, 24);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(10, 14);
          ctx.lineTo(18, 26);
          ctx.lineTo(10, 24);
          ctx.closePath();
          ctx.fill();

          // Engine Bell Nozzle
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.moveTo(-7, 24);
          ctx.lineTo(7, 24);
          ctx.lineTo(11, 32);
          ctx.lineTo(-11, 32);
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
  }, [isSimulating, isFinished, beacons]);

  const handleFinishDebrief = () => {
    // 3-Star scoring calculation
    const altRatio = Math.min(1.0, telemetry.altitudeM / 140000);
    const velRatio = Math.min(1.0, telemetry.velocityMps / 7200);
    const corridorScoreRatio = Math.min(1.0, telemetry.corridorScore / 300);
    const starScore = telemetry.starsCollected * 10;

    const finalSimScore = Math.round((altRatio * 35 + velRatio * 35 + corridorScoreRatio * 20 + starScore));
    onComplete(Math.max(40, Math.min(100, finalSimScore)));
  };

  const s1Percent = (telemetry.stage1FuelKg / (tank.fuelKg * 0.65)) * 100;
  const s2Percent = (telemetry.stage2FuelKg / (tank.fuelKg * 0.35)) * 100;

  return (
    <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
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
          <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stars: {telemetry.starsCollected} / 8</span>
          </div>

          {telemetry.altitudeM > 100000 && (
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded-full text-xs font-bold font-mono">
              KARMAN LINE REACHED (SPACE)
            </span>
          )}
        </div>
      </div>

      {/* Viewport and Flight Instrument Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-space-950 shadow-inner flex flex-col justify-center items-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={460}
            className="w-full h-[360px] sm:h-[430px] object-cover"
          />

          {/* On-Screen Steering & Staging Controls (Direct Arcade Buttons) */}
          {isSimulating && !isFinished && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              {/* Steer Left Button */}
              <button
                onMouseDown={() => setSteerInput(-1)}
                onMouseUp={() => setSteerInput(0)}
                onTouchStart={() => setSteerInput(-1)}
                onTouchEnd={() => setSteerInput(0)}
                className="p-3.5 bg-space-900/90 hover:bg-space-800 text-sky-400 rounded-2xl border border-sky-500/40 active:scale-95 transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 font-mono text-xs font-bold select-none cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">PITCH UP [A]</span>
              </button>

              {/* Stage Separation Button (Flashes when Stage 1 is burned out) */}
              {telemetry.isStage1BurnedOut && !telemetry.isStageSeparated ? (
                <button
                  onClick={triggerStageSeparation}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-2xl border-2 border-yellow-300 animate-bounce shadow-xl flex items-center gap-2 select-none cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>DETACH BOOSTERS (SPACE)</span>
                </button>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-slate-800">
                  Use [A] / [D] or Arrow Keys to steer into green corridor
                </div>
              )}

              {/* Steer Right Button */}
              <button
                onMouseDown={() => setSteerInput(1)}
                onMouseUp={() => setSteerInput(0)}
                onTouchStart={() => setSteerInput(1)}
                onTouchEnd={() => setSteerInput(0)}
                className="p-3.5 bg-space-900/90 hover:bg-space-800 text-sky-400 rounded-2xl border border-sky-500/40 active:scale-95 transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 font-mono text-xs font-bold select-none cursor-pointer"
              >
                <span className="hidden sm:inline">PITCH RIGHT [D]</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-sm z-20">
              <div className="text-xs font-mono uppercase tracking-widest text-sky-400 mb-2">
                MAIN PROPULSION T-MINUS
              </div>
              <div className="text-8xl font-black font-display text-amber-400 animate-ping">
                {countdown === 0 ? "LIFTOFF" : countdown}
              </div>
              <p className="text-xs text-slate-300 mt-4">Get ready to steer into the green flight corridor!</p>
            </div>
          )}

          {/* End Simulation Modal Overlay */}
          {isFinished && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              {success ? (
                <div className="space-y-4 max-w-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto text-3xl">
                    ⭐
                  </div>
                  <h4 className="text-2xl font-black text-white font-display">
                    ORBITAL INSERTION ACHIEVED!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cadet reached {(telemetry.altitudeM / 1000).toFixed(0)} km apogee at {(telemetry.velocityMps).toFixed(0)} m/s! You gathered {telemetry.starsCollected} telemetry stars and maintained perfect flight path alignment.
                  </p>
                  <Button
                    onClick={handleFinishDebrief}
                    variant="accent"
                    size="lg"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Proceed to Scientific Debrief
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-w-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center mx-auto text-3xl">
                    🪂
                  </div>
                  <h4 className="text-2xl font-black text-white font-display">
                    SUB-ORBITAL OCEAN SPLASHDOWN
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The capsule deployed parachutes and splashed down safely! Altitude reached: {(telemetry.altitudeM / 1000).toFixed(0)} km. To reach circular orbit, steer into the green corridor and separate Stage 1 boosters when empty!
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={onRestart} variant="secondary" icon={<RotateCcw className="w-4 h-4" />}>
                      Fly Again
                    </Button>
                    <Button onClick={handleFinishDebrief} variant="primary">
                      Take Quiz Anyway
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-Time Flight Gauges (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-space-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>Flight Telemetry</span>
              <span className={`text-[11px] font-bold ${telemetry.inCorridor ? 'text-emerald-400' : 'text-rose-400'}`}>
                {telemetry.inCorridor ? '✓ On Corridor' : '⚠ Off Corridor'}
              </span>
            </h4>

            {/* Altitude Gauge */}
            <div className="p-3 bg-space-950 rounded-2xl border border-slate-800">
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
            <div className="p-3 bg-space-950 rounded-2xl border border-slate-800">
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
            <div className="p-3 bg-space-950 rounded-2xl border border-slate-800">
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
