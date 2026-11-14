import React from 'react';
import { Lock, Play, CheckCircle2, Clock, Award, Sparkles, Rocket, Radio, Moon, Cpu, Satellite, ShieldAlert } from 'lucide-react';
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

const missionIcons: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-5 h-5" />,
  Radio: <Radio className="w-5 h-5" />,
  Moon: <Moon className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Satellite: <Satellite className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
};

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

  const IconComponent = missionIcons[mission.icon] || <Rocket className="w-5 h-5" />;

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden backdrop-blur-xl ${
        isLocked
          ? 'bg-[#0a0b2e]/60 border-[#1f245c]/40 opacity-60 cursor-not-allowed'
          : isComplete
          ? 'bg-[#12153f]/90 border-emerald-500/40 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/15 cursor-pointer hover:-translate-y-1.5'
          : 'bg-[#12153f]/90 border-[#2e336d]/70 hover:border-indigo-400/60 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer hover:-translate-y-1.5'
      }`}
      data-testid={`mission-card-${mission.id}`}
    >
      <div>
        {/* Top Status & Stage Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
              STAGE 0{mission.unlockOrder}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-400 font-medium">{mission.category}</span>
          </div>

          <div>
            {isLocked && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0a0b2e] border border-[#1f245c] text-slate-500">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
            {isComplete && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Score: {score}%
              </span>
            )}
            {!isLocked && !isComplete && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                <Sparkles className="w-3 h-3" /> Active
              </span>
            )}
          </div>
        </div>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
              isLocked
                ? 'bg-slate-900/60 border-slate-800 text-slate-600'
                : 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300'
            }`}
          >
            {IconComponent}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
              {mission.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {mission.tagline}
            </p>
          </div>
        </div>

        {/* Standards Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-3">
          {mission.standards.map(std => (
            <span
              key={std}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0a0b2e]/80 border border-[#1f245c]/60 text-slate-400"
            >
              {std}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 border-t border-[#1f245c]/60 flex items-center justify-between text-xs">
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
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold text-xs transition-all ${
              isLocked
                ? 'bg-[#0a0b2e] border-[#1f245c] text-slate-600'
                : isComplete
                ? 'bg-emerald-500 hover:bg-emerald-400 text-space-950 border-emerald-400/40 shadow-md group-hover:scale-105'
                : 'bg-emerald-500 hover:bg-emerald-400 text-space-950 border-emerald-400/40 shadow-md group-hover:scale-105'
            }`}
          >
            {isLocked ? (
              <><Lock className="w-3.5 h-3.5" /> <span>Locked</span></>
            ) : isComplete ? (
              <><Play className="w-3 h-3 fill-current" /> <span>Review</span></>
            ) : (
              <><Play className="w-3 h-3 fill-current" /> <span>Launch</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
