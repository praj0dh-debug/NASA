import React from 'react';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import badgesData from '../../data/badges.json';

interface BadgeCardProps {
  badgeId: string;
  onClick?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badgeId, onClick }) => {
  const { hasBadge, badges } = useProgress();
  const badgeDef = badgesData.find(b => b.id === badgeId);
  const earned = hasBadge(badgeId);
  const earnedRecord = badges.find(b => b.badgeId === badgeId);

  if (!badgeDef) return null;

  return (
    <div
      onClick={onClick}
      className={`relative group rounded-2xl p-4 transition-all duration-300 border ${
        earned
          ? 'bg-gradient-to-b from-space-800/90 to-space-900/90 border-amber-400/50 shadow-lg shadow-amber-500/10 hover:border-amber-300 hover:scale-[1.02] cursor-pointer'
          : 'bg-space-900/50 border-slate-800 opacity-60 hover:opacity-80'
      }`}
    >
      {earned && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 p-1 rounded-full shadow-md animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
            earned
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-200 text-slate-950'
              : 'bg-space-800 border-slate-700 text-slate-500'
          }`}
        >
          {earned ? <Award className="w-8 h-8" /> : <Lock className="w-6 h-6" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="font-bold text-sm text-slate-100 truncate">{badgeDef.label}</h4>
            {earned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {badgeDef.description}
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
            {earned ? (
              <>
                <span className="text-amber-400 font-semibold">Score: {earnedRecord?.score || 100}%</span>
                <span className="text-slate-500">
                  {earnedRecord?.earnedAt ? new Date(earnedRecord.earnedAt).toLocaleDateString() : 'Awarded'}
                </span>
              </>
            ) : (
              <span className="text-slate-500 italic">Criteria: {badgeDef.criteria}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

