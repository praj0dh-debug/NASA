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
      className={`relative group rounded-2xl p-4 transition-all duration-300 border backdrop-blur-xl ${
        earned
          ? 'bg-[#16124a]/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10 hover:border-emerald-300 hover:scale-[1.02] cursor-pointer'
          : 'bg-[#0a0b2e]/60 border-[#1f245c]/40 opacity-60 hover:opacity-80'
      }`}
    >
      {earned && (
        <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-space-950 p-1 rounded-full shadow-md animate-bounce">
          <Sparkles className="w-3 h-3" />
        </div>
      )}

      <div className="flex items-start gap-3.5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            earned
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 text-space-950 shadow-md shadow-emerald-500/20'
              : 'bg-[#0a0b2e] border-[#1f245c] text-slate-600'
          }`}
        >
          {earned ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="font-bold text-sm text-slate-100 truncate">{badgeDef.label}</h4>
            {earned && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {badgeDef.description}
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
            {earned ? (
              <>
                <span className="text-emerald-400 font-semibold">Score: {earnedRecord?.score || 100}%</span>
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
