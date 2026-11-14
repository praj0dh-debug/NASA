import React, { useState } from 'react';
import { Compass, Sparkles, Orbit, CheckCircle2, Lock, ArrowRight, Grid, Map } from 'lucide-react';
import { MissionCard, MissionData } from './MissionCard';
import { BadgeCard } from '../common/BadgeCard';
import { NarratorBubble } from '../common/NarratorBubble';
import { useProgress } from '../../context/ProgressContext';
import missionsList from '../../data/missions.index.json';
import badgesList from '../../data/badges.json';

interface MissionMapProps {
  onSelectMission: (missionId: string) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({ onSelectMission }) => {
  const { progress, badges, getMissionStatus } = useProgress();
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  const completedCount = Object.values(progress).filter(p => p.status === 'complete').length;

  return (
    <div id="missions" className="space-y-8 animate-fadeIn max-w-7xl mx-auto py-8">
      {/* Mentor Welcome Bubble in BeanMachine styling */}
      <NarratorBubble
        avatar="👩‍🚀"
        title="Flight Director Vega"
        message="Welcome to the NASA Artemis STEM Mission Deck! Master orbital mechanics in Rocket Launch to unlock our lunar base, Mars rover coding, and planetary defense simulators."
      />

      {/* Hero Flight Pathway Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12153f] via-[#1a1050] to-[#16124a] border border-[#2e336d]/70 p-6 sm:p-8 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/15 border border-purple-400/30 rounded-full text-purple-300 text-xs font-semibold mb-3">
              <Orbit className="w-3.5 h-3.5 animate-spin" />
              <span>Artemis Spaceflight Progression</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Aerospace Simulation Platforms
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Step through 6 authentic aerospace engineering scenarios. Each completed flight debrief earns a certified NASA Cadet Badge and unlocks the next planetary trajectory.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-[#0a0b2e]/90 p-1.5 rounded-xl border border-[#1f245c]/70 shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-space-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Orbital Path</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-space-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Mission Grid</span>
            </button>
          </div>
        </div>

        {/* Atmospheric Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Visual Journey Roadmap (when viewMode === 'map') */}
      {viewMode === 'map' && (
        <div className="bg-[#12153f]/80 border border-[#2e336d]/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1f245c]/60">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              <span>Artemis Flight Sequence</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Completed: <span className="text-emerald-400 font-bold">{completedCount}</span> / 6 Missions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(missionsList as MissionData[]).map((mission, index) => {
              const status = getMissionStatus(mission.id);
              const isLocked = status === 'locked';
              const isComplete = status === 'complete';

              return (
                <div
                  key={mission.id}
                  onClick={() => !isLocked && onSelectMission(mission.id)}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    isLocked
                      ? 'bg-[#0a0b2e]/50 border-[#1f245c]/30 opacity-60 cursor-not-allowed'
                      : isComplete
                      ? 'bg-[#16124a]/90 border-emerald-500/40 hover:border-emerald-300 hover:scale-[1.02] cursor-pointer shadow-lg shadow-emerald-500/10'
                      : 'bg-[#16124a]/90 border-[#2e336d]/70 hover:border-indigo-400/70 hover:scale-[1.02] cursor-pointer shadow-xl shadow-indigo-500/15'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-[#0a0b2e] border border-[#1f245c] flex items-center justify-center font-mono font-bold text-xs text-purple-300">
                      0{index + 1}
                    </span>

                    {isLocked ? (
                      <span className="p-1.5 bg-[#0a0b2e] rounded-lg text-slate-600 border border-[#1f245c]">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : isComplete ? (
                      <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Ready
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base mb-1">{mission.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {mission.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1f245c]/50 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">{mission.category}</span>
                    <span className={isLocked ? 'text-slate-600' : 'text-emerald-400 font-bold flex items-center gap-1'}>
                      {isLocked ? 'Locked' : 'Launch'} {!isLocked && <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(missionsList as MissionData[]).map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onSelect={onSelectMission}
            />
          ))}
        </div>
      )}

      {/* Earned Badges Showcase */}
      <div className="bg-[#12153f]/80 border border-[#2e336d]/60 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f245c]/60">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Certified Aerospace Credentials & Badges</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Achieve scores of 70% or higher in simulation debriefs to be awarded NASA Artemis credentials.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
            {badges.length} / 6 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesList.map(b => (
            <BadgeCard key={b.id} badgeId={b.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
