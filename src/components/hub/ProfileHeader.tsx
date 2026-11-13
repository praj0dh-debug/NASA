import React from 'react';
import { Award, Zap, Sliders, ShieldCheck, User, School, Sparkles, RotateCcw } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useProgress } from '../../context/ProgressContext';
import { Button } from '../common/Button';

interface ProfileHeaderProps {
  onOpenSettings: () => void;
  onOpenProfileSetup: () => void;
  onResetProgress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onOpenSettings,
  onOpenProfileSetup,
  onResetProgress
}) => {
  const { profile, isTeacherMode, setTeacherMode } = useUser();
  const { badges, totalXp, rankTitle, unlockAllMissionsForDemo } = useProgress();

  return (
    <header className="bg-space-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & NASA Artemis Theme */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-nasa-blue to-indigo-600 shadow-lg shadow-blue-500/20 border border-blue-400/40">
            <span className="text-xl">🚀</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-white text-base tracking-wider uppercase">
                JUNIOR ASTRONAUT
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                NASA STEM
              </span>
            </div>
            <div className="text-[11px] text-sky-400 font-mono flex items-center gap-1.5">
              <span>ARTEMIS CADET SIMULATOR</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">MISSION FLIGHT DECK</span>
            </div>
          </div>
        </div>

        {/* Center: Cadet Status & XP */}
        <div className="hidden md:flex items-center gap-4 bg-space-950/80 px-4 py-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={onOpenProfileSetup}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity cursor-pointer group"
            title="Edit Cadet Profile"
          >
            <div className="w-8 h-8 rounded-xl bg-space-800 border border-slate-700 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              {profile?.avatar || '👨‍🚀'}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{profile?.nickname || 'Cadet Nova'}</span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-950/70 px-1 rounded border border-sky-800/40">
                  {profile?.callsign || 'STAR-SEEKER'}
                </span>
              </div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{rankTitle}</span>
              </div>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-800" />

          {/* XP & Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-sky-300 font-mono font-bold" title="Mission XP">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{totalXp} XP</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-amber-400 font-mono font-bold" title="Badges Earned">
              <Award className="w-4 h-4" />
              <span>{badges.length} / 6</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Teacher / Classroom Mode toggle */}
          <button
            onClick={() => setTeacherMode(!isTeacherMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isTeacherMode
                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20'
                : 'bg-space-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Educator Roster View"
          >
            <School className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isTeacherMode ? "Cadet View" : "Teacher Hub"}</span>
          </button>

          {/* Demo Unlock All */}
          <button
            onClick={unlockAllMissionsForDemo}
            className="hidden lg:flex px-2.5 py-1.5 bg-space-800 hover:bg-space-700 border border-slate-700 rounded-xl text-[11px] text-slate-300 font-semibold items-center gap-1 transition-colors"
            title="Unlock all missions for testing / demonstration"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Unlock All</span>
          </button>

          {/* Accessibility Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-space-800 hover:bg-space-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Accessibility Settings (WCAG 2.1 AA)"
            aria-label="Open Accessibility Panel"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Cadet Profile Button (Mobile) */}
          <button
            onClick={onOpenProfileSetup}
            className="md:hidden p-2 bg-space-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Cadet Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

