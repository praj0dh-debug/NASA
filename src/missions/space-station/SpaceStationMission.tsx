import React, { useState, useEffect } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { Button } from '../../components/common/Button';
import { Zap, Wind, AlertCircle, ShieldAlert, CheckCircle2, BatteryCharging, Radio } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface SpaceStationMissionProps {
  onExit: () => void;
}

export const SpaceStationMission: React.FC<SpaceStationMissionProps> = ({ onExit }) => {
  // Plan State: Power Allocation
  const [lifeSupportPower, setLifeSupportPower] = useState(45);
  const [researchPower, setResearchPower] = useState(30);
  const [commsPower, setCommsPower] = useState(25);

  // Execute State
  const [simActive, setSimActive] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState(95);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [inEclipse, setInEclipse] = useState(false);
  const [anomaly, setAnomaly] = useState<'none' | 'leak' | 'resolved'>('none');
  const [simTime, setSimTime] = useState(0);

  const totalPower = lifeSupportPower + researchPower + commsPower;

  const quizQuestions = [
    {
      id: "ss-q1",
      question: "How do astronauts aboard the International Space Station generate breathable oxygen?",
      options: [
        "By burning dry paper",
        "By electrolysis of recycled water (splitting H2O into hydrogen and oxygen)",
        "By opening the airlock periodically",
        "By storing liquid oxygen tanks from 10 years ago"
      ],
      correctIndex: 1,
      explanation: "Electrolysis uses electricity from solar arrays to split H2O into breathable O2 gas and hydrogen!"
    },
    {
      id: "ss-q2",
      question: "Why do space stations rely on rechargeable battery banks during orbital flight?",
      options: [
        "Because solar panels get too hot",
        "During orbital eclipse (Earth's shadow), solar panels receive zero sunlight for ~45 minutes each orbit",
        "To power the rocket boosters continuously",
        "To communicate with deep space probes only"
      ],
      correctIndex: 1,
      explanation: "Orbiting Earth every 90 minutes means 45 minutes of direct sun and 45 minutes of complete shadow!"
    },
    {
      id: "ss-q3",
      question: "What physical protection shields astronauts from micro-meteoroids traveling at 10 km/s?",
      options: [
        "Thick glass windows",
        "Whipple shields with spaced aluminum and Kevlar layers to vaporize incoming debris",
        "Magnetic force fields",
        "Lead paint coatings"
      ],
      correctIndex: 1,
      explanation: "Whipple shields have outer bumper sheets that shatter incoming hypervelocity particles into harmless clouds."
    }
  ];

  return (
    <MissionShell
      missionId="space-station"
      title="Orbital Space Station Life Support"
      category="Environmental Systems & Electrical Grid"
      badgeId="station-commander"
      onExit={onExit}
      planComponent={onReady => (
        <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Electrical Bus & Life Support Power Plan
              </h3>
              <p className="text-xs text-slate-400">
                Allocate your 100 kW solar array power budget across critical station systems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Life Support */}
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                  <Wind className="w-4 h-4" /> Oxygen & CO2
                </span>
                <span className="font-mono font-bold text-white">{lifeSupportPower} kW</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={lifeSupportPower}
                onChange={e => setLifeSupportPower(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Minimum 40 kW required for 6-person crew breathing air.</p>
            </div>

            {/* Microgravity Research */}
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Science Labs
                </span>
                <span className="font-mono font-bold text-white">{researchPower} kW</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={researchPower}
                onChange={e => setResearchPower(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Powers protein crystal growth and botany racks.</p>
            </div>

            {/* Communications */}
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                  <Radio className="w-4 h-4" /> Telemetry & Ku-Band
                </span>
                <span className="font-mono font-bold text-white">{commsPower} kW</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={commsPower}
                onChange={e => setCommsPower(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Transmits real-time video and flight telemetry.</p>
            </div>
          </div>

          <div className="p-4 bg-space-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono">TOTAL SOLAR GRID LOAD:</span>
              <div className={`text-lg font-mono font-bold ${totalPower <= 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPower} kW / 100 kW Available
              </div>
            </div>

            <Button
              onClick={onReady}
              disabled={totalPower > 100 || lifeSupportPower < 40}
              variant="accent"
              size="lg"
            >
              Verify Station & Begin Orbit
            </Button>
          </div>
        </div>
      )}
      executeComponent={onSimComplete => {
        return (
          <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400">STATION CONTROL ROOM</span>
                <h3 className="text-xl font-black text-white font-display">
                  ISS Cupola Microgravity Operations
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  inEclipse ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {inEclipse ? "🌙 ORBITAL ECLIPSE (BATTERY)" : "☀️ SOLAR POWERED"}
                </span>
              </div>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-space-900 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>CABIN OXYGEN PRESSURE</span>
                  <span className="text-cyan-400 font-bold">{oxygenLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all" style={{ width: `${oxygenLevel}%` }} />
                </div>
              </div>

              <div className="p-4 bg-space-900 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>STORAGE BATTERIES</span>
                  <span className="text-amber-400 font-bold">{batteryLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${batteryLevel}%` }} />
                </div>
              </div>
            </div>

            {/* Anomaly Event Trigger */}
            <div className="p-6 bg-space-900 border border-slate-800 rounded-3xl text-center space-y-4">
              {anomaly === 'none' && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-emerald-400 font-bold">ALL SUBSYSTEMS NOMINAL</div>
                  <p className="text-sm text-slate-300">
                    Station has maintained orbit for 180 minutes. Simulate a sudden micrometeoroid decompression alert to test emergency protocol.
                  </p>
                  <Button
                    onClick={() => {
                      soundEffects.playWarning();
                      setAnomaly('leak');
                      setOxygenLevel(78);
                    }}
                    variant="danger"
                    icon={<AlertCircle className="w-4 h-4" />}
                  >
                    Trigger Micrometeorite Alert
                  </Button>
                </div>
              )}

              {anomaly === 'leak' && (
                <div className="space-y-4 animate-pulse">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/40">
                    <ShieldAlert className="w-4 h-4" />
                    RAPID CABIN PRESSURE DROP IN NODE 2!
                  </div>
                  <p className="text-xs text-rose-200">
                    Emergency: Seal the automatic isolation hatch to contain pressure loss and reroute secondary oxygen scrubbers!
                  </p>
                  <Button
                    onClick={() => {
                      soundEffects.playSuccess();
                      setAnomaly('resolved');
                      setOxygenLevel(96);
                    }}
                    variant="accent"
                    size="lg"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                  >
                    Seal Hatch & Engage Emergency Scrubbers
                  </Button>
                </div>
              )}

              {anomaly === 'resolved' && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                    HATCH SEALED • PRESSURE STABILIZED
                  </div>
                  <p className="text-xs text-slate-300">
                    Outstanding emergency response, Commander! Node 2 isolated, 100% crew safety confirmed.
                  </p>
                  <Button
                    onClick={() => onSimComplete(95)}
                    variant="primary"
                    size="lg"
                  >
                    Complete Station Ops & Review Quiz
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      }}
      quizQuestions={quizQuestions}
    />
  );
};

