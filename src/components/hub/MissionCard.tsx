import React from 'react';
import { Lock, Play, CheckCircle2, Clock, Sparkles, Award } from 'lucide-react';
import { useProgress, MissionStatus } from '../../context/ProgressContext';
import { soundEffects } from '../../lib/soundEffects';

export interface MissionData {
  id: string;
  title: string;
  tagline: string;
  ageRange: [number, number];
  unlockOrder: number;
  difficulty: string;
  category: string;
  standards: string[];
  estMinutes: number;
  badge: string;
  icon: string;
  color: string;
  accentColor: string;
}

interface MissionCardProps {
  mission: MissionData;
  onSelect: (missionId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onSelect }) => {
  const { getMissionStatus, getMissionScore, hasBadge } = useProgress();
  const status: MissionStatus = getMissionStatus(mission.id);
  const score = getMissionScore(mission.id);
  const isLocked = status === 'locked';
  const isComplete = status === 'complete';
  const earnedBadge = hasBadge(mission.badge);

  const handleClick = () => {
    if (!isLocked) {
      soundEffects.playClick();
      onSelect(mission.id);
    } else {
      soundEffects.playWarning();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden backdrop-blur-md ${
        isLocked
          ? 'bg-space-950/60 border-slate-800/80 opacity-60 cursor-not-allowed'
          : isComplete
          ? 'bg-gradient-to-b from-space-900/90 to-space-850/90 border-emerald-500/40 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer hover:-translate-y-1'
          : 'bg-gradient-to-b from-space-900/90 to-space-850/90 border-sky-500/40 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/20 cursor-pointer hover:-translate-y-1'
      }`}
    >
      {/* Top Banner & Unlock Tag */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              STAGE 0{mission.unlockOrder}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-sky-400 font-semibold">{mission.category}</span>
          </div>

          <div>
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-space-800 border border-slate-700 text-slate-400">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
            {isComplete && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Score: {score}%
              </span>
            )}
            {!isLocked && !isComplete && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 border border-sky-400/40 text-sky-300 animate-pulse">
                Ready for Launch
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-black text-white font-display mb-2 group-hover:text-sky-300 transition-colors">
          {mission.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 line-clamp-2">
          {mission.tagline}
        </p>

        {/* Standards Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {mission.standards.map(std => (
            <span
              key={std}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-space-950 border border-slate-800 text-slate-400"
            >
              {std}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {mission.estMinutes}m
          </span>
          <span>Ages {mission.ageRange[0]}-{mission.ageRange[1]}</span>
        </div>

        <div className="flex items-center gap-2">
          {earnedBadge && (
            <span title="Mission Badge Earned">
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
            </span>
          )}

          <div
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
              isLocked
                ? 'bg-space-800 border-slate-700 text-slate-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30 group-hover:scale-105'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </div>
        </div>
      </div>
    </div>
  );
};
