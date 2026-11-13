import React, { useState } from 'react';
import { ProfileHeader } from './components/hub/ProfileHeader';
import { MissionMap } from './components/hub/MissionMap';
import { SettingsPanel } from './components/accessibility/SettingsPanel';
import { ChildProfileSetup } from './components/auth/ChildProfileSetup';
import { ParentConsentFlow } from './components/auth/ParentConsentFlow';
import { RosterView } from './components/teacher/RosterView';
import { useUser } from './context/UserContext';
import { useProgress } from './context/ProgressContext';

// Mission components
import { RocketLaunchMission } from './missions/rocket-launch/RocketLaunchMission';
import { SpaceStationMission } from './missions/space-station/SpaceStationMission';
import { LunarMission } from './missions/lunar-exploration/LunarMission';
import { MarsRoverMission } from './missions/mars-rover-code/MarsRoverMission';
import { SatelliteMission } from './missions/satellite-design/SatelliteMission';
import { AsteroidMission } from './missions/asteroid-deflection/AsteroidMission';

export const App: React.FC = () => {
  const { profile, isTeacherMode, updateProfile } = useUser();
  const { resetProgress } = useProgress();

  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);

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
      {/* Top Application Header */}
      <ProfileHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfileSetup={() => setIsProfileSetupOpen(true)}
        onResetProgress={resetProgress}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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
            className="hover:text-emerald-400 transition-colors underline cursor-pointer"
          >
            COPPA Parental Consent Gate
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-sky-400 transition-colors underline cursor-pointer"
          >
            WCAG 2.1 AA Accessibility
          </button>
        </div>
        <p className="text-[11px] text-slate-600">
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

