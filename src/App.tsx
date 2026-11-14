import React, { useState } from 'react';
import { ProfileHeader } from './components/hub/ProfileHeader';
import { MissionMap } from './components/hub/MissionMap';
import { SettingsPanel } from './components/accessibility/SettingsPanel';
import { ChildProfileSetup } from './components/auth/ChildProfileSetup';
import { ParentConsentFlow } from './components/auth/ParentConsentFlow';
import { RosterView } from './components/teacher/RosterView';
import { useUser } from './context/UserContext';
import { useProgress } from './context/ProgressContext';
import { WifiOff, RotateCcw, X, ArrowLeft } from 'lucide-react';

// BeanMachine UI components
import { BeanMachineNav, HeroSection, ServiceGrid, SpaceShowcase, StarField } from './components/landing';

// Mission components
import { RocketLaunchMission } from './missions/rocket-launch/RocketLaunchMission';
import { SpaceStationMission } from './missions/space-station/SpaceStationMission';
import { LunarMission } from './missions/lunar-exploration/LunarMission';
import { MarsRoverMission } from './missions/mars-rover-code/MarsRoverMission';
import { SatelliteMission } from './missions/satellite-design/SatelliteMission';
import { AsteroidMission } from './missions/asteroid-deflection/AsteroidMission';

/**
 * App — Unified NASA Project with the complete BeanMachine Space UI.
 *
 * Combines:
 *  1. BeanMachineNav: Sticky top navigation with dropdowns, cadet status, and settings
 *  2. HeroSection: "We develop scalable platforms that help companies grow" + "Launch Project"
 *  3. ServiceGrid: "What we build" 4-column cards (Web Apps, Mobile Apps, Websites, Hybrid Apps)
 *  4. NASA Mission Deck: Integrated 6-stage flight simulator, trophies, and debriefing
 *  5. SpaceShowcase: Bottom futuristic dome cityscape
 *  6. Full-screen active mission runner maintaining the BeanMachine space aesthetic
 */
export const App: React.FC = () => {
  const { isTeacherMode, setTeacherMode, updateProfile } = useUser();
  const { resetProgress, apiError, refreshProgress } = useProgress();

  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [dismissError, setDismissError] = useState(false);
  const [showMissionHub, setShowMissionHub] = useState(false);

  const handleSelectMission = (missionId: string) => {
    setActiveMissionId(missionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitMission = () => {
    setActiveMissionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchProject = () => {
    const el = document.getElementById('missions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveMissionId('rocket-launch');
    }
  };

  const handleEnterMissionHub = () => {
    setShowMissionHub(true);
    handleLaunchProject();
  };

  const handleBackToLanding = () => {
    setShowMissionHub(false);
    setActiveMissionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLandingView = !activeMissionId && !isTeacherMode;

  return (
    <div className="min-h-screen bg-[#0a0b2e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-space-950">
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* Unified Top Navigation in BeanMachine Design */}
      <BeanMachineNav
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfileSetup={() => setIsProfileSetupOpen(true)}
        onBackToHome={handleBackToLanding}
        showBackToHome={!!activeMissionId || isTeacherMode}
      />

      {/* Network / Offline fallback status bar */}
      {apiError && !dismissError && (
        <aside aria-label="Network Status Alert" className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-4 mt-16 sm:mt-20 z-40 relative">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Telemetry Link Alert: {apiError}. Local flight recorder active.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshProgress()}
              className="flex items-center gap-1 font-bold text-amber-300 hover:text-white underline px-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Link</span>
            </button>
            <button
              onClick={() => setDismissError(true)}
              className="p-1 text-amber-400 hover:text-white cursor-pointer"
              aria-label="Dismiss network alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Router */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {activeMissionId ? (
          /* ═══════ Active Mission Simulation View ═══════ */
          <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <StarField count={80} />

            <div className="relative z-10">
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
          </div>
        ) : isTeacherMode ? (
          /* ═══════ Educator Roster View ═══════ */
          <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <StarField count={60} />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setTeacherMode(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12153f]/80 hover:bg-[#1a1e5a] border border-[#2e336d]/70 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  data-testid="back-to-landing"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cadet View</span>
                </button>
              </div>
              <div className="bg-[#12153f]/80 border border-[#2e336d]/60 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
                <RosterView />
              </div>
            </div>
          </div>
        ) : (
          /* ═══════ Unified Main Experience ═══════ */
          <>
            {/* 1. Hero Section */}
            <HeroSection onLaunchProject={handleLaunchProject} />

            {/* 2. Service Grid ("What we build") */}
            <div className="relative z-10 bg-gradient-to-b from-[#1a1050] via-[#12153f] to-[#12153f]/90">
              <ServiceGrid />
            </div>

            {/* 3. NASA Artemis Mission Deck (styled in BeanMachine aesthetic) */}
            <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
              <MissionMap onSelectMission={handleSelectMission} />
            </section>

            {/* 4. Bottom Space Showcase */}
            <SpaceShowcase />
          </>
        )}
      </main>

      {/* Space Footer */}
      <footer className="relative z-10 bg-[#0a0b2e] border-t border-[#1f245c]/50 py-8 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mb-4">
            <span className="font-semibold text-slate-300">Junior Astronaut STEM Academy • NASA Artemis Program</span>
            <span>•</span>
            <button
              onClick={() => {
                setActiveMissionId(null);
                setTeacherMode(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={handleEnterMissionHub}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
              data-testid="enter-mission-hub"
            >
              Missions
            </button>
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
              className="hover:text-purple-300 transition-colors underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-1"
            >
              WCAG 2.1 AA Accessibility
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Built for elementary STEM learners (Ages 5-11). Aligned with Next Generation Science Standards (NGSS).
          </p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isProfileSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
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
