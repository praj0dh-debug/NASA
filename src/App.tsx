import React, { useState } from 'react';
import { ProfileHeader } from './components/hub/ProfileHeader';
import { MissionMap } from './components/hub/MissionMap';
import { SettingsPanel } from './components/accessibility/SettingsPanel';
import { ChildProfileSetup } from './components/auth/ChildProfileSetup';
import { ParentConsentFlow } from './components/auth/ParentConsentFlow';
import { RosterView } from './components/teacher/RosterView';
import { useUser } from './context/UserContext';
import { useProgress } from './context/ProgressContext';
import { WifiOff, RotateCcw, X } from 'lucide-react';

// Mission components
import { RocketLaunchMission } from './missions/rocket-launch/RocketLaunchMission';
import { SpaceStationMission } from './missions/space-station/SpaceStationMission';
import { LunarMission } from './missions/lunar-exploration/LunarMission';
import { MarsRoverMission } from './missions/mars-rover-code/MarsRoverMission';
import { SatelliteMission } from './missions/satellite-design/SatelliteMission';
import { AsteroidMission } from './missions/asteroid-deflection/AsteroidMission';

export const App: React.FC = () => {
  const { isTeacherMode, updateProfile } = useUser();
  const { resetProgress, apiError, refreshProgress } = useProgress();

  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [dismissError, setDismissError] = useState(false);

  const handleSelectMission = (missionId: string) => {
    setActiveMissionId(missionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitMission = () => {
    setActiveMissionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-space-950">
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl"
      >
        Skip to main flight deck
      </a>

      {/* Top Application Header */}
      <ProfileHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfileSetup={() => setIsProfileSetupOpen(true)}
        onResetProgress={resetProgress}
      />

      {/* Network / Offline fallback status bar */}
      {apiError && !dismissError && (
        <aside aria-label="Network Status Alert" className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Telemetry Link Alert: {apiError}. Local flight recorder active.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshProgress()}
              className="flex items-center gap-1 font-bold text-amber-300 hover:text-white underline px-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Link</span>
            </button>
            <button
              onClick={() => setDismissError(true)}
              className="p-1 text-amber-400 hover:text-white"
              aria-label="Dismiss network alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Body */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 focus:outline-none" tabIndex={-1}>
        {/* If in Teacher Mode, display Educator Roster & NGSS alignment */}
        {isTeacherMode ? (
          <RosterView />
        ) : activeMissionId ? (
          // Active Mission Router
          <div>
            {activeMissionId === 'rocket-launch' && (
              <RocketLaunchMission onExit={handleExitMission} />
            )}
            {activeMissionId === 'space-station' && (
              <SpaceStationMission onExit={handleExitMission} />
            )}
            {activeMissionId === 'lunar-exploration' && (
              <LunarMission onExit={handleExitMission} />
            )}
            {activeMissionId === 'mars-rover-code' && (
              <MarsRoverMission onExit={handleExitMission} />
            )}
            {activeMissionId === 'satellite-design' && (
              <SatelliteMission onExit={handleExitMission} />
            )}
            {activeMissionId === 'asteroid-deflection' && (
              <AsteroidMission onExit={handleExitMission} />
            )}
          </div>
        ) : (
          // Default Space Journey Mission Map
          <MissionMap onSelectMission={handleSelectMission} />
        )}
      </main>

      {/* Footer with NASA Disclaimer & COPPA Safe Stamp */}
      <footer className="bg-space-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <span>Junior Astronaut Mission Trainer</span>
          <span>•</span>
          <span>NASA Artemis STEM Academy</span>
          <span>•</span>
          <button
            onClick={() => setIsConsentOpen(true)}
            className="hover:text-emerald-400 transition-colors underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded px-1"
          >
            COPPA Parental Consent Gate
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-sky-400 transition-colors underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 rounded px-1"
          >
            WCAG 2.1 AA Accessibility
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Built for elementary STEM learners (Ages 5-11). Aligned with NGSS (Next Generation Science Standards).
        </p>
      </footer>

      {/* Modals & Dialogs */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isProfileSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl">
            <ChildProfileSetup onComplete={() => setIsProfileSetupOpen(false)} />
          </div>
        </div>
      )}

      {isConsentOpen && (
        <ParentConsentFlow
          onConsentApproved={email => {
            updateProfile({ parentEmail: email, consentGranted: true });
            setIsConsentOpen(false);
          }}
          onCancel={() => setIsConsentOpen(false)}
        />
      )}
    </div>
  );
};
