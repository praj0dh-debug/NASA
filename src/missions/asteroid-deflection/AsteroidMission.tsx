import React, { useState } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { Button } from '../../components/common/Button';
import { ShieldAlert, Crosshair, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface AsteroidMissionProps {
  onExit: () => void;
}

export const AsteroidMission: React.FC<AsteroidMissionProps> = ({ onExit }) => {
  const [method, setMethod] = useState<'kinetic' | 'gravity'>('kinetic');
  const [leadTimeYears, setLeadTimeYears] = useState<number>(5);
  const [impactVelocityKps, setImpactVelocityKps] = useState<number>(6.5);

  // Trajectory calculation
  // Deflection distance (in thousands of km) = leadTimeYears * impactVelocityKps * multiplier
  const deflectionDistanceKm = Math.round(leadTimeYears * impactVelocityKps * 850);
  const earthRadiusKm = 6371;
  const isSafe = deflectionDistanceKm > 25000;

  const quizQuestions = [
    {
      id: "ast-q1",
      question: "What historic NASA mission successfully tested the kinetic impactor technique by crashing into asteroid Dimorphos in 2022?",
      options: [
        "Apollo 11",
        "DART (Double Asteroid Redirection Test)",
        "Voyager 1",
        "Hubble Space Telescope"
      ],
      correctIndex: 1,
      explanation: "DART collided at 6.6 km/s, altering Dimorphos's orbital period by 33 minutes and proving asteroid deflection is viable!"
    },
    {
      id: "ast-q2",
      question: "According to conservation of linear momentum, why does early warning lead time matter so much for deflecting an asteroid?",
      options: [
        "Because asteroids speed up when they see spaceships",
        "A tiny nudge (velocity change of a few millimeters per second) compounds over years into thousands of kilometers of trajectory shift by the time it reaches Earth",
        "It doesn't matter at all",
        "Because spacecraft only fly on weekends"
      ],
      correctIndex: 1,
      explanation: "Over 5 or 10 years, even a microscopic change in velocity causes the asteroid to arrive hours late, missing Earth by a wide margin!"
    },
    {
      id: "ast-q3",
      question: "What is a 'Gravity Tractor' asteroid deflection method?",
      options: [
        "A massive heavy spacecraft hovers near the asteroid for months, using mutual gravitational attraction to gently tug the asteroid off course without risking fragmenting it",
        "A tractor beam from science fiction movies",
        "Raping the asteroid with dynamite",
        "Towing it with a physical chain"
      ],
      correctIndex: 0,
      explanation: "A gravity tractor uses pure gravity between the craft's mass and the asteroid to pull it slowly and steadily!"
    }
  ];

  return (
    <MissionShell
      missionId="asteroid-deflection"
      title="Planetary Defense DART Simulator"
      category="Orbital Mechanics & Planetary Defense"
      badgeId="planetary-defender"
      onExit={onExit}
      planComponent={onReady => (
        <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Planetary Defense Deflection Protocol
              </h3>
              <p className="text-xs text-slate-400">
                A 160-meter asteroid has a 12% probability of Earth impact. Calculate intercept parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-purple-300">1. Countermeasure Strategy</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMethod('kinetic')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    method === 'kinetic'
                      ? 'bg-purple-600/20 border-purple-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Kinetic Impactor (DART Autonomous Probe)</div>
                  <div className="text-[11px] text-slate-400">High-speed hypervelocity collision transfers direct linear momentum.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('gravity')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    method === 'gravity'
                      ? 'bg-purple-600/20 border-purple-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Ion Gravity Tractor</div>
                  <div className="text-[11px] text-slate-400">Gentle gravitational tug for rubble-pile asteroids that might shatter.</div>
                </button>
              </div>
            </div>

            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-purple-300">2. Intercept Parameters</h4>
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span>Lead Time:</span>
                  <span className="text-purple-400 font-bold">{leadTimeYears} Years Prior to Impact</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={leadTimeYears}
                  onChange={e => setLeadTimeYears(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                  <span>Impactor Velocity:</span>
                  <span className="text-purple-400 font-bold">{impactVelocityKps} km/s</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.5"
                  value={impactVelocityKps}
                  onChange={e => setImpactVelocityKps(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-space-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono">PROJECTED MISS DISTANCE:</span>
              <div className={`text-lg font-mono font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deflectionDistanceKm.toLocaleString()} km {isSafe ? '(Earth Safe!)' : '(Danger - Too Close!)'}
              </div>
            </div>

            <Button onClick={onReady} disabled={!isSafe} variant="accent" size="lg">
              Launch Planetary Defense Interceptor
            </Button>
          </div>
        </div>
      )}
      executeComponent={onSimComplete => (
        <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-purple-400">DART INTERCEPT VECTOR</span>
              <h3 className="text-xl font-black text-white font-display">
                Kinetic Collision & Orbital Deflection
              </h3>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
              Miss Distance: +{deflectionDistanceKm.toLocaleString()} km
            </span>
          </div>

          <div className="p-8 bg-space-900 border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-3xl flex items-center justify-center mx-auto text-4xl">
              💥
            </div>
            <h4 className="text-xl font-black text-white font-display">
              Impact Successful • Asteroid Deflected!
            </h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Target orbital vector adjusted by 2.4 mm/s. Compounded over {leadTimeYears} years of lead time, the asteroid safely bypasses Earth outside the lunar orbit!
            </p>

            <Button onClick={() => onSimComplete(100)} variant="accent" size="lg">
              Proceed to Planetary Defense Debrief
            </Button>
          </div>
        </div>
      )}
      quizQuestions={quizQuestions}
    />
  );
};

