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
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Mentor Welcome Bubble */}
      <NarratorBubble
        avatar="👩‍🚀"
        title="Flight Director Vega"
        message="Welcome to the NASA Artemis Cadet Flight Deck! Master orbital mechanics in Rocket Launch to unlock our lunar base, Mars rover coding, and planetary defense simulators."
      />

      {/* Hero Flight Pathway Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-space-900 via-space-850 to-blue-950/70 border border-sky-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-xs font-semibold mb-3">
              <Orbit className="w-3.5 h-3.5 animate-spin" />
              <span>Artemis Spaceflight Progression</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
              Space Journey Mission Map
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Step through 6 authentic aerospace engineering scenarios. Each completed flight debrief earns a certified NASA Cadet Badge and unlocks the next planetary trajectory.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-space-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Orbital Path</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Mission Grid</span>
            </button>
          </div>
        </div>

        {/* Background glow orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Visual Journey Roadmap (when viewMode === 'map') */}
      {viewMode === 'map' && (
        <div className="bg-space-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <span>Artemis Flight Sequence (Planets & Orbits)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Completed: <span className="text-sky-300 font-bold">{completedCount}</span> / 6 Missions
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
                  className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    isLocked
                      ? 'bg-space-950/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                      : isComplete
                      ? 'bg-gradient-to-b from-space-850 to-space-900 border-emerald-500/40 hover:border-emerald-300 hover:scale-[1.02] cursor-pointer shadow-lg shadow-emerald-500/5'
                      : 'bg-gradient-to-b from-space-850 to-space-900 border-sky-400/50 hover:border-sky-300 hover:scale-[1.02] cursor-pointer shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="w-10 h-10 rounded-2xl bg-space-800 border border-slate-700 flex items-center justify-center font-display font-black text-sm text-sky-400">
                      0{index + 1}
                    </span>

                    {isLocked ? (
                      <span className="p-1.5 bg-space-800 rounded-xl text-slate-500 border border-slate-700">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : isComplete ? (
                      <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40 animate-pulse">
                        Active Vector
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base mb-1">{mission.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {mission.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{mission.category}</span>
                    <span className={isLocked ? 'text-slate-600' : 'text-sky-400 font-bold flex items-center gap-1'}>
                      {isLocked ? 'Locked' : 'Engage'} {!isLocked && <ArrowRight className="w-3.5 h-3.5" />}
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
      <div className="bg-space-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Astronaut Trophy Case & NASA Flight Badges</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Achieve scores of 70% or higher in simulation debriefs to be awarded NASA Artemis credentials.
            </p>
          </div>
          <span className="text-sm font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
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

