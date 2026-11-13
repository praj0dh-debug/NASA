import React, { useState } from 'react';
import { MissionShell } from '../engine/MissionShell';
import { Button } from '../../components/common/Button';
import { Satellite, Radio, Globe, Zap, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../lib/soundEffects';

interface SatelliteMissionProps {
  onExit: () => void;
}

export const SatelliteMission: React.FC<SatelliteMissionProps> = ({ onExit }) => {
  const [sensor, setSensor] = useState<'optical' | 'radar'>('radar');
  const [orbitAltitude, setOrbitAltitude] = useState<number>(550); // 400 to 800 km LEO
  const [solarSpan, setSolarSpan] = useState<'standard' | 'extended'>('extended');

  const quizQuestions = [
    {
      id: "sat-q1",
      question: "Why do Synthetic Aperture Radar (SAR) satellites image Earth through thick storm clouds and at night?",
      options: [
        "They carry giant spotlights",
        "Radar emits active microwave radio pulses that penetrate clouds, volcanic ash, and darkness, bouncing back to the antenna",
        "They use magic lenses",
        "They fly underneath the clouds"
      ],
      correctIndex: 1,
      explanation: "Microwaves easily pass through dense cloud cover and weather, unlike visible light!"
    },
    {
      id: "sat-q2",
      question: "What is a Polar Sun-Synchronous Orbit (SSO) commonly used for Earth-observing satellites?",
      options: [
        "An orbit where the satellite only visits the North Pole",
        "An orbit passing over the poles that crosses the equator at the exact same local solar time each day, ensuring consistent shadows for climate tracking",
        "An orbit inside the atmosphere",
        "An orbit around the Sun itself"
      ],
      correctIndex: 1,
      explanation: "Sun-synchronous orbits keep the lighting angle constant so scientists can detect deforestation, ice melting, and crop health accurately!"
    },
    {
      id: "sat-q3",
      question: "How do ion thrusters maneuver satellites over years with very little propellant?",
      options: [
        "By burning gasoline",
        "By electrically ionizing noble gases like Xenon and accelerating them with electric fields to ultra-high exhaust velocities",
        "By blowing fans",
        "By throwing weights overboard"
      ],
      correctIndex: 1,
      explanation: "Ion engines have extremely high specific impulse (Isp > 3000s), making them hyper-efficient for long orbital stationkeeping."
    }
  ];

  return (
    <MissionShell
      missionId="satellite-design"
      title="Earth Observation Satellite Design"
      category="Spacecraft Systems & Climate Sensing"
      badgeId="orbit-architect"
      onExit={onExit}
      planComponent={onReady => (
        <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Satellite className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Earth Observation Payload Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Design an orbital climate observatory to map ocean surface temperatures and polar ice shelves.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-300">1. Primary Sensor Suite</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSensor('optical')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    sensor === 'optical'
                      ? 'bg-emerald-600/20 border-emerald-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Multispectral High-Res Optical Imager</div>
                  <div className="text-[11px] text-slate-400">Captures visible & near-infrared bands for crop and forest health.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSensor('radar')}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    sensor === 'radar'
                      ? 'bg-emerald-600/20 border-emerald-400 text-white'
                      : 'bg-space-850 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Synthetic Aperture Radar (SAR) Antenna</div>
                  <div className="text-[11px] text-slate-400">Penetrates storm clouds and darkness to map millimeter ice shelf elevation.</div>
                </button>
              </div>
            </div>

            <div className="bg-space-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-300">2. Orbital Altitude Configuration</h4>
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Altitude: {orbitAltitude} km</span>
                <span className="text-emerald-400">LEO Sun-Synchronous</span>
              </div>
              <input
                type="range"
                min="400"
                max="800"
                step="50"
                value={orbitAltitude}
                onChange={e => setOrbitAltitude(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                550 km provides a 16-day global Earth surface repeat cycle.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button onClick={onReady} variant="accent" size="lg">
              Launch Satellite into Sun-Synchronous Orbit
            </Button>
          </div>
        </div>
      )}
      executeComponent={onSimComplete => (
        <div className="bg-space-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400">LEO TELEMETRY DOWNLINK</span>
              <h3 className="text-xl font-black text-white font-display">
                Global Earth Observation Coverage
              </h3>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
              Altitude: {orbitAltitude} km • Swath: 140 km
            </span>
          </div>

          <div className="p-8 bg-space-900 border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto text-4xl">
              🛰️
            </div>
            <h4 className="text-lg font-bold text-white">Telemetry & Data Downlink Nominal</h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Satellite is transmitting high-speed Ka-Band radar packets directly to NASA Svalbard & White Sands ground stations. 99.4% global ocean topography coverage mapped!
            </p>

            <Button onClick={() => onSimComplete(100)} variant="accent" size="lg">
              Analyze Satellite Data & Complete Debrief
            </Button>
          </div>
        </div>
      )}
      quizQuestions={quizQuestions}
    />
  );
};

