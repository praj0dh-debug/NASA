import React, { useState, useEffect, useRef } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { Button } from '../../components/common/Button';
import { Moon, Shield, Sparkles, Compass, CheckCircle2, RotateCcw, Flame, ArrowLeft, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface LunarMissionProps {
  onExit: () => void;
}

export const LunarMission: React.FC<LunarMissionProps> = ({ onExit }) => {
  // Plan Stage: Base Modules
  const [selectedHab, setSelectedHab] = useState<'inflatable' | 'regolith-3d'>('regolith-3d');
  const [powerSource, setPowerSource] = useState<'solar-tower' | 'fission'>('solar-tower');

  // Execute Stage: Lunar Lander Descent Simulator
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLandingSim, setIsLandingSim] = useState(true);
  const [landerY, setLanderY] = useState(40);
  const [landerX, setLanderX] = useState(360);
  const [velY, setVelY] = useState(2.0);
  const [velX, setVelX] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [touchdownState, setTouchdownState] = useState<'descending' | 'landed' | 'crashed'>('descending');
  const [thrusting, setThrusting] = useState(false);
  const [steer, setSteer] = useState(0); // -1 left, 1 right

  // Rock sample collection post-landing
  const [samplesCollected, setSamplesCollected] = useState<string[]>([]);

  const rocks = [
    { id: 'anorthosite', name: 'Lunar Anorthosite (Genesis Rock)', composition: 'Rich in plagioclase feldspar, records 4.4B year Moon crust history.', icon: '🪨' },
    { id: 'ice-regolith', name: 'Permanently Shadowed Water-Ice Core', composition: 'Crucial for rocket propellant fuel (hydrogen/oxygen) and astronaut hydration.', icon: '🧊' },
    { id: 'ilmenite', name: 'Titanium-Rich Ilmenite', composition: 'Can be heated to extract oxygen directly from lunar soil (ISRU).', icon: '💎' }
  ];

  // Keyboard controls for Lunar Lander
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (touchdownState !== 'descending') return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setThrusting(true);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setSteer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSteer(1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setThrusting(false);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setSteer(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [touchdownState]);

  // Lunar Lander Physics Loop (Moon gravity: 1.62 m/s^2)
  useEffect(() => {
    if (touchdownState !== 'descending') return;

    let animId: number;
    let last = performance.now();

    const update = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      setLanderY(prevY => {
        let currentVy = velY;
        let currentVx = velX;
        let currentFuel = fuel;

        // Gravity pulls down
        currentVy += 1.62 * dt * 8;

        // Thrust pushes up
        if (thrusting && currentFuel > 0) {
          currentVy -= 3.8 * dt * 8;
          currentFuel = Math.max(0, currentFuel - dt * 15);
          soundEffects.playRocketThrust(0.08);
        }

        // Steering horizontal thrust
        if (steer !== 0 && currentFuel > 0) {
          currentVx += steer * 2.5 * dt * 8;
          currentFuel = Math.max(0, currentFuel - dt * 5);
        }

        setVelY(currentVy);
        setVelX(currentVx);
        setFuel(currentFuel);

        setLanderX(prevX => Math.max(80, Math.min(640, prevX + currentVx * dt * 10)));

        const groundY = 320;
        const newY = prevY + currentVy * dt * 10;

        if (newY >= groundY) {
          // Touchdown check
          if (Math.abs(currentVy) < 8.5) {
            setTouchdownState('landed');
            soundEffects.playSuccess();
          } else {
            setTouchdownState('crashed');
            soundEffects.playWarning();
          }
          return groundY;
        }

        return newY;
      });

      // Canvas Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Black moon sky with stars
          ctx.fillStyle = '#050714';
          ctx.fillRect(0, 0, w, h);

          // Stars
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 40; i++) {
            ctx.fillRect((i * 73) % w, (i * 47) % (h * 0.7), 1.5, 1.5);
          }

          // Distant Earth in sky
          ctx.beginPath();
          ctx.arc(w - 70, 70, 24, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(w - 65, 68, 16, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.fill();

          // Lunar surface & craters
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(0, 340);
          ctx.lineTo(150, 345);
          ctx.quadraticCurveTo(250, 360, 350, 345); // Crater dip
          ctx.lineTo(w, 340);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fill();

          // Designated Landing Pad
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(w / 2 - 50, 342, 100, 6);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('TARGET PAD SHACKLETON', w / 2 - 60, 362);

          // Draw Lunar Lander
          ctx.save();
          ctx.translate(landerX, landerY);

          // Exhaust flame if thrusting
          if (thrusting && fuel > 0) {
            ctx.fillStyle = '#F97316';
            ctx.beginPath();
            ctx.moveTo(-6, 16);
            ctx.lineTo(6, 16);
            ctx.lineTo(0, 28 + Math.random() * 8);
            ctx.closePath();
            ctx.fill();
          }

          // Lander Body (Gold foil & white ascent stage)
          ctx.fillStyle = '#FCD34D';
          ctx.fillRect(-14, 0, 28, 16); // Descent stage
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(0, -4, 12, 0, Math.PI * 2); // Crew capsule
          ctx.fill();

          // Window
          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(0, -6, 3, 0, Math.PI * 2);
          ctx.fill();

          // Landing Legs
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-12, 12);
          ctx.lineTo(-22, 22);
          ctx.moveTo(12, 12);
          ctx.lineTo(22, 22);
          ctx.stroke();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [touchdownState, thrusting, steer, fuel, velY, velX, landerX]);

  const restartLanding = () => {
    setLanderY(40);
    setLanderX(360);
    setVelY(2.0);
    setVelX(0);
    setFuel(100);
    setTouchdownState('descending');
    setThrusting(false);
    setSteer(0);
  };

  const handleCollectRock = (id: string) => {
    if (!samplesCollected.includes(id)) {
      soundEffects.playSuccess();
      setSamplesCollected(prev => [...prev, id]);
    }
  };

  const quizQuestions = [
    {
      id: "lm-q1",
      question: "Why is NASA landing Artemis astronauts at the Moon's South Pole rather than the equator?",
      options: [
        "Because it has warm beaches",
        "Permanently shadowed craters harbor billions of tons of water-ice essential for survival and rocket propellant",
        "The gravity is 10 times stronger there",
        "It is closer to Mars"
      ],
      correctIndex: 1,
      explanation: "Shackleton and Faustini craters never see direct sunlight and act as cryogenic cold traps preserving ancient water-ice!"
    },
    {
      id: "lm-q2",
      question: "Why do lunar habitats require thick regolith (lunar soil) shielding?",
      options: [
        "To keep rain out",
        "To protect astronauts from intense solar cosmic radiation, solar flares, and micrometeoroids since the Moon lacks an atmosphere",
        "To make the habitat invisible from Earth",
        "Because regolith smells pleasant"
      ],
      correctIndex: 1,
      explanation: "Without an atmosphere or magnetic field like Earth, several meters of lunar regolith provides vital radiation protection."
    },
    {
      id: "lm-q3",
      question: "What does ISRU stand for in NASA deep space exploration?",
      options: [
        "In-Situ Resource Utilization (living off the land by making water, oxygen, and fuel locally)",
        "International Space Rocket Union",
        "Interplanetary Solar Radio Unit",
        "Immediate Satellite Repair Utility"
      ],
      correctIndex: 0,
      explanation: "ISRU means making what you need from local resources so you don't have to carry every drop of fuel from Earth!"
    }
  ];

  return (
    <MissionShell
      missionId="lunar-exploration"
      title="Artemis Lunar Base & Rock Analysis"
      category="Lunar Geology & Surface Habitats"
      badgeId="lunar-geologist"
      onExit={onExit}
      planComponent={onReady => (
        <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Artemis Base Camp Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Configure habitat shielding and power systems for South Pole surface operations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300">1. Habitat Shielding</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedHab('inflatable')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedHab === 'inflatable'
                      ? 'bg-indigo-600/20 border-indigo-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Lightweight Inflatable Module</div>
                  <div className="text-[11px] text-slate-400">Rapid deployment, moderate micrometeorite protection.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHab('regolith-3d')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedHab === 'regolith-3d'
                      ? 'bg-indigo-600/20 border-indigo-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">3D-Printed Sintered Regolith Dome</div>
                  <div className="text-[11px] text-slate-400">Maximum radiation and thermal insulation shield.</div>
                </button>
              </div>
            </div>

            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300">2. Surface Power Grid</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPowerSource('solar-tower')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    powerSource === 'solar-tower'
                      ? 'bg-indigo-600/20 border-indigo-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Vertical Solar Tower on Crater Peak</div>
                  <div className="text-[11px] text-slate-400">Continuous sunlight at peak of eternal light.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPowerSource('fission')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    powerSource === 'fission'
                      ? 'bg-indigo-600/20 border-indigo-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Fission Surface Power Reactor (40 kW)</div>
                  <div className="text-[11px] text-slate-400">Continuous reliable baseline power during total lunar eclipse.</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button onClick={onReady} variant="accent" size="lg">
              Begin Lunar Lander Descent
            </Button>
          </div>
        </div>
      )}
      executeComponent={onSimComplete => (
        <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400">SHACKLETON CRATER TOUCHDOWN</span>
              <h3 className="text-xl font-black text-white font-display">
                Artemis Human Landing System (HLS)
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">DESCENT SPEED:</span>
              <span className={`font-bold ${Math.abs(velY) < 8.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(velY * 0.4).toFixed(1)} m/s (Max 3.5 m/s)
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">FUEL: {fuel.toFixed(0)}%</span>
            </div>
          </div>

          {/* Interactive Lunar Lander Canvas */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-space-950 shadow-inner flex flex-col items-center">
            <canvas ref={canvasRef} width={720} height={380} className="w-full h-[320px] object-cover" />

            {/* On-Screen Touch Controls */}
            {touchdownState === 'descending' && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <button
                  onMouseDown={() => setSteer(-1)}
                  onMouseUp={() => setSteer(0)}
                  onTouchStart={() => setSteer(-1)}
                  onTouchEnd={() => setSteer(0)}
                  className="p-3 bg-space-900/90 text-sky-400 rounded-2xl border border-sky-500/40 font-mono text-xs font-bold active:scale-95 transition-all shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onMouseDown={() => setThrusting(true)}
                  onMouseUp={() => setThrusting(false)}
                  onTouchStart={() => setThrusting(true)}
                  onTouchEnd={() => setThrusting(false)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-2xl border border-yellow-300 active:scale-95 transition-all shadow-xl flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 fill-current" />
                  <span>THRUSTER [SPACE]</span>
                </button>

                <button
                  onMouseDown={() => setSteer(1)}
                  onMouseUp={() => setSteer(0)}
                  onTouchStart={() => setSteer(1)}
                  onTouchEnd={() => setSteer(0)}
                  className="p-3 bg-space-900/90 text-sky-400 rounded-2xl border border-sky-500/40 font-mono text-xs font-bold active:scale-95 transition-all shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Crash or Landed Alerts */}
            {touchdownState === 'crashed' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="text-4xl">💥</div>
                <h4 className="text-xl font-bold text-rose-400">Hard Touchdown!</h4>
                <p className="text-xs text-slate-300">Descent velocity was too high. Fire thrusters earlier to cushion landing.</p>
                <Button onClick={restartLanding} variant="secondary" icon={<RotateCcw className="w-4 h-4" />}>
                  Retry Landing
                </Button>
              </div>
            )}

            {touchdownState === 'landed' && (
              <div className="absolute top-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Touchdown Confirmed! Now deploy rover to scan samples below.
              </div>
            )}
          </div>

          {/* Rock Sampling Section (Unlocked after touchdown) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>South Pole Geology & Spectrometer Scan ({samplesCollected.length} / 3 Cataloged)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {rocks.map(rock => {
                const collected = samplesCollected.includes(rock.id);
                return (
                  <div
                    key={rock.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      collected ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-space-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-1">{rock.icon}</div>
                      <div className="font-bold text-xs text-white mb-1">{rock.name}</div>
                      <p className="text-[11px] text-slate-400 mb-3">{rock.composition}</p>
                    </div>

                    <Button
                      onClick={() => handleCollectRock(rock.id)}
                      disabled={collected || touchdownState !== 'landed'}
                      variant={collected ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {collected ? "Spectrometer Cataloged" : "Scan Sample"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button
                onClick={() => onSimComplete(100)}
                disabled={touchdownState !== 'landed' || samplesCollected.length < 2}
                variant="accent"
                size="lg"
              >
                Analyze Samples in Base Lab & Take Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
      quizQuestions={quizQuestions}
    />
  );
};
