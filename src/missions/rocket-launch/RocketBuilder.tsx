import React from 'react';
import { Rocket, Gauge, Scale, Flame, AlertTriangle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { RocketConfig, CapsuleSpec, TankSpec, EngineSpec, calculateRocketMass, calculateTWR, calculateDeltaV } from './rocketPhysics';
import configData from './config.json';
import { Button } from '../../components/common/Button';
import { soundEffects } from '../../lib/soundEffects';

interface RocketBuilderProps {
  config: RocketConfig;
  onChange: (newConfig: RocketConfig) => void;
  onLaunch: () => void;
}

export const RocketBuilder: React.FC<RocketBuilderProps> = ({ config, onChange, onLaunch }) => {
  const { capsules, tanks, engines } = configData.components;

  const selectedCapsule = capsules.find(c => c.id === config.capsuleId) || capsules[0];
  const selectedTank = tanks.find(t => t.id === config.tankId) || tanks[0];
  const selectedEngine = engines.find(e => e.id === config.engineId) || engines[0];

  const wetMass = calculateRocketMass(selectedCapsule, selectedTank, selectedTank.fuelKg);
  const dryMass = calculateRocketMass(selectedCapsule, selectedTank, 0);
  const thrustN = selectedEngine.thrustKn * 1000 * (config.throttlePercent / 100);
  const twr = calculateTWR(thrustN, wetMass, 0);
  const deltaV = calculateDeltaV(selectedEngine.isp, wetMass, dryMass);

  const canLiftOff = twr >= 1.15;
  const idealTwr = twr >= 1.25 && twr <= 2.2;

  const handleCapsuleSelect = (id: string) => {
    soundEffects.playClick();
    onChange({ ...config, capsuleId: id });
  };

  const handleTankSelect = (id: string) => {
    soundEffects.playClick();
    onChange({ ...config, tankId: id });
  };

  const handleEngineSelect = (id: string) => {
    soundEffects.playClick();
    onChange({ ...config, engineId: id });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Workshop Configuration (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Step 1: Payload / Capsule */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-900/50 text-purple-300 border border-purple-700/50 font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Payload & Crew Capsule</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{selectedCapsule.massKg.toLocaleString()} kg</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {capsules.map(cap => (
              <button
                key={cap.id}
                onClick={() => handleCapsuleSelect(cap.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.capsuleId === cap.id
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0a0b2e]/70 border-[#1f245c]/70 text-slate-400 hover:border-[#2e336d] hover:bg-[#16124a]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white mb-1">{cap.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cap.description}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1f245c]/60">
                  Mass: {cap.massKg} kg {cap.crew > 0 ? `• Crew: ${cap.crew}` : '• Robotic'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Propellant Tank */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-900/50 text-purple-300 border border-purple-700/50 font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Propellant & Fuel Core</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{selectedTank.fuelKg.toLocaleString()} kg Fuel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tanks.map(tank => (
              <button
                key={tank.id}
                onClick={() => handleTankSelect(tank.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.tankId === tank.id
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0a0b2e]/70 border-[#1f245c]/70 text-slate-400 hover:border-[#2e336d] hover:bg-[#16124a]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white mb-1">{tank.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tank.description}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1f245c]/60">
                  Fuel: {tank.fuelKg / 1000}t • Burn: ~{tank.burnSeconds}s
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Propulsion Engine */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-900/50 text-purple-300 border border-purple-700/50 font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Rocket Propulsion Engine</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">{selectedEngine.thrustKn.toLocaleString()} kN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {engines.map(eng => (
              <button
                key={eng.id}
                onClick={() => handleEngineSelect(eng.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.engineId === eng.id
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0a0b2e]/70 border-[#1f245c]/70 text-slate-400 hover:border-[#2e336d] hover:bg-[#16124a]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-white mb-1">{eng.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {eng.description}
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-[#1f245c]/60">
                  Thrust: {eng.thrustKn} kN • Isp: {eng.isp}s
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Flight Trajectory Controls */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
          <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span>Launch Profile & Guidance Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Throttle Power</span>
                <span className="font-mono text-emerald-400 font-bold">{config.throttlePercent}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={config.throttlePercent}
                onChange={e => onChange({ ...config, throttlePercent: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Full thrust recommended for liftoff</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Gravity Turn Pitch Angle</span>
                <span className="font-mono text-purple-400 font-bold">{config.pitchAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={config.pitchAngleDeg}
                onChange={e => onChange({ ...config, pitchAngleDeg: Number(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">20°-30° achieves optimal horizontal velocity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Rocket Schematic & Telemetry Pre-Flight Check (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Visual Rocket Assembly Blueprint */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center backdrop-blur-xl">
          <div className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-4">
            Artemis Vehicle Assembly Building (VAB)
          </div>

          {/* Schematic SVG rendering */}
          <div className="relative w-48 h-64 flex flex-col items-center justify-end my-2">
            {/* Capsule */}
            <div className="w-14 h-16 bg-gradient-to-b from-indigo-400 to-purple-600 rounded-t-full flex items-center justify-center text-xs font-bold text-white shadow-md border border-indigo-300 transition-all duration-300">
              <span className="text-lg">👩‍🚀</span>
            </div>

            {/* Fuel Tank */}
            <div
              className={`w-20 transition-all duration-300 bg-gradient-to-b from-slate-200 via-emerald-400 to-slate-300 border-x-2 border-slate-400 flex flex-col items-center justify-center text-[10px] font-mono font-bold text-slate-900 shadow-inner ${
                config.tankId === 'tank-heavy'
                  ? 'h-32 w-24'
                  : config.tankId === 'tank-standard'
                  ? 'h-24 w-20'
                  : 'h-18 w-16'
              }`}
            >
              <span>NASA</span>
              <span className="text-[9px] text-slate-700">LIQUID O2</span>
            </div>

            {/* Engine Nozzles */}
            <div className="w-16 h-8 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-lg border-x border-b border-amber-500/50 flex items-center justify-around px-2">
              <div className="w-3 h-4 bg-amber-500/80 rounded-b-md animate-pulse" />
              <div className="w-4 h-5 bg-orange-500 rounded-b-md animate-pulse" />
              <div className="w-3 h-4 bg-amber-500/80 rounded-b-md animate-pulse" />
            </div>

            {/* Launch Stand */}
            <div className="w-36 h-2 bg-slate-600 rounded-full mt-1" />
          </div>

          <div className="text-xs font-mono text-slate-400 mt-2">
            {selectedCapsule.name} + {selectedTank.name}
          </div>
        </div>

        {/* Telemetry Predictions Box */}
        <div className="bg-[#12153f]/85 border border-[#2e336d]/70 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-xl">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>Pre-Flight Telemetry Check</span>
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-[#1f245c]/60">
              <span className="text-slate-400">Total Liftoff Mass:</span>
              <span className="font-bold text-white">{(wetMass / 1000).toFixed(1)} metric tons</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#1f245c]/60">
              <span className="text-slate-400">Liftoff Thrust:</span>
              <span className="font-bold text-emerald-400">{(thrustN / 1000).toFixed(0)} kN</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#1f245c]/60">
              <span className="text-slate-400">Thrust-to-Weight (TWR):</span>
              <span className={`font-bold text-sm ${canLiftOff ? (idealTwr ? 'text-emerald-400' : 'text-amber-400') : 'text-rose-400'}`}>
                {twr.toFixed(2)} {canLiftOff ? (idealTwr ? '✓ Ideal' : '⚠ High') : '✗ Too Heavy!'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Estimated Delta-V:</span>
              <span className="font-bold text-purple-300">{deltaV.toFixed(0)} m/s</span>
            </div>
          </div>

          {/* Warning Banner if TWR is bad */}
          {!canLiftOff && (
            <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Rocket too heavy for selected engine! Upgrade propulsion or reduce propellant size.</span>
            </div>
          )}

          {/* Ready for Launch Action Button */}
          <button
            onClick={onLaunch}
            disabled={!canLiftOff}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-emerald-500 hover:bg-emerald-400 text-space-950 shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Proceed to Launch Pad</span>
          </button>
        </div>
      </div>
    </div>
  );
};
