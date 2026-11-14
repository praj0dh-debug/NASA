import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import missionsData from '../data/missions.index.json';
import badgesData from '../data/badges.json';
import { apiClient } from '../lib/apiClient';
import { useUser } from './UserContext';

export type MissionStatus = 'locked' | 'unlocked' | 'in_progress' | 'complete';

export interface MissionProgress {
  missionId: string;
  status: MissionStatus;
  score: number;
  completedAt?: string;
  attempts: number;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  missionId: string;
  score: number;
}

interface ProgressContextType {
  progress: Record<string, MissionProgress>;
  badges: EarnedBadge[];
  isLoading: boolean;
  apiError: string | null;
  completeMission: (missionId: string, score: number) => Promise<{ newlyEarnedBadge?: string; nextUnlockedMission?: string }>;
  startMission: (missionId: string) => void;
  resetProgress: () => void;
  unlockAllMissionsForDemo: () => void;
  getMissionStatus: (missionId: string) => MissionStatus;
  getMissionScore: (missionId: string) => number;
  hasBadge: (badgeId: string) => boolean;
  totalXp: number;
  rankTitle: string;
  refreshProgress: () => Promise<void>;
}

const STORAGE_KEY = 'junior_astronaut_progress_v1';
const BADGES_KEY = 'junior_astronaut_badges_v1';

const initialProgress: Record<string, MissionProgress> = {
  'rocket-launch': { missionId: 'rocket-launch', status: 'unlocked', score: 0, attempts: 0 },
  'space-station': { missionId: 'space-station', status: 'locked', score: 0, attempts: 0 },
  'lunar-exploration': { missionId: 'lunar-exploration', status: 'locked', score: 0, attempts: 0 },
  'mars-rover-code': { missionId: 'mars-rover-code', status: 'locked', score: 0, attempts: 0 },
  'satellite-design': { missionId: 'satellite-design', status: 'locked', score: 0, attempts: 0 },
  'asteroid-deflection': { missionId: 'asteroid-deflection', status: 'locked', score: 0, attempts: 0 },
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [progress, setProgress] = useState<Record<string, MissionProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialProgress, ...JSON.parse(saved) } : initialProgress;
    } catch {
      return initialProgress;
    }
  });

  const [badges, setBadges] = useState<EarnedBadge[]>(() => {
    try {
      const saved = localStorage.getItem(BADGES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local storage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  }, [badges]);

  // Sync with real backend on load and profile change
  const refreshProgress = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    setApiError(null);

    try {
      const [progRes, badgeRes] = await Promise.allSettled([
        apiClient.getProgress(profile.id),
        apiClient.getBadges(profile.id)
      ]);

      if (progRes.status === 'fulfilled' && progRes.value.progress) {
        setProgress(prev => ({
          ...prev,
          ...progRes.value.progress
        }));
      }

      if (badgeRes.status === 'fulfilled' && Array.isArray(badgeRes.value.badges)) {
        setBadges(badgeRes.value.badges);
      }
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || 'Unable to sync with telemetry server. Operating in offline flight recorder mode.');
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const getMissionStatus = (missionId: string): MissionStatus => {
    return progress[missionId]?.status || 'locked';
  };

  const getMissionScore = (missionId: string): number => {
    return progress[missionId]?.score || 0;
  };

  const hasBadge = (badgeId: string): boolean => {
    return badges.some(b => b.badgeId === badgeId);
  };

  const startMission = (missionId: string) => {
    setProgress(prev => {
      const current = prev[missionId] || { missionId, status: 'unlocked', score: 0, attempts: 0 };
      const updated: Record<string, MissionProgress> = {
        ...prev,
        [missionId]: {
          ...current,
          status: (current.status === 'complete' ? 'complete' : 'in_progress') as MissionStatus,
          attempts: current.attempts + 1
        }
      };
      return updated;
    });

    if (profile?.id) {
      apiClient.saveProgress(profile.id, missionId, getMissionScore(missionId), 'in_progress').catch(() => {
        // Handled silently for offline mode
      });
    }
  };

  const completeMission = async (missionId: string, score: number) => {
    let newlyEarnedBadge: string | undefined;
    let nextUnlockedMission: string | undefined;

    // Check for badge reward
    const targetBadgeDef = badgesData.find(b => b.missionId === missionId);
    if (targetBadgeDef && score >= 70 && !hasBadge(targetBadgeDef.id)) {
      newlyEarnedBadge = targetBadgeDef.id;
      const newBadgeRecord: EarnedBadge = {
        badgeId: targetBadgeDef.id,
        earnedAt: new Date().toISOString(),
        missionId,
        score
      };
      setBadges(prev => [...prev, newBadgeRecord]);

      if (profile?.id) {
        apiClient.awardBadge(profile.id, targetBadgeDef.id, missionId, score).catch(() => {});
      }
    }

    // Determine next mission to unlock
    const currentMissionDef = missionsData.find(m => m.id === missionId);
    if (currentMissionDef) {
      const nextMission = missionsData.find(m => m.unlockOrder === currentMissionDef.unlockOrder + 1);
      if (nextMission) {
        nextUnlockedMission = nextMission.id;
      }
    }

    setProgress(prev => {
      const current = prev[missionId] || { missionId, status: 'complete', score: 0, attempts: 1 };
      const updated = {
        ...prev,
        [missionId]: {
          ...current,
          status: 'complete' as MissionStatus,
          score: Math.max(current.score, score),
          completedAt: new Date().toISOString()
        }
      };

      if (nextUnlockedMission && updated[nextUnlockedMission]?.status === 'locked') {
        updated[nextUnlockedMission] = {
          ...updated[nextUnlockedMission],
          status: 'unlocked'
        };
      }

      return updated;
    });

    // Persist to server
    if (profile?.id) {
      try {
        await apiClient.saveProgress(profile.id, missionId, score, 'complete');
      } catch (err) {
        const error = err as Error;
        setApiError(`Progress saved locally. Server sync failed: ${error.message}`);
      }
    }

    return { newlyEarnedBadge, nextUnlockedMission };
  };

  const unlockAllMissionsForDemo = () => {
    setProgress(prev => {
      const unlocked: Record<string, MissionProgress> = {};
      Object.keys(prev).forEach(mId => {
        unlocked[mId] = {
          ...prev[mId],
          status: prev[mId].status === 'complete' ? 'complete' : 'unlocked'
        };
      });
      return unlocked;
    });
  };

  const resetProgress = () => {
    setProgress(initialProgress);
    setBadges([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BADGES_KEY);
  };

  const totalScore = Object.values(progress).reduce((acc, curr) => acc + curr.score, 0);
  const totalXp = totalScore * 10 + badges.length * 250;

  let rankTitle = 'Cadet Recruit';
  if (badges.length >= 6) rankTitle = 'Commander of the Fleet';
  else if (badges.length >= 4) rankTitle = 'Senior Flight Specialist';
  else if (badges.length >= 2) rankTitle = 'Lead Mission Pilot';
  else if (badges.length >= 1) rankTitle = 'Junior Astronaut';

  return (
    <ProgressContext.Provider
      value={{
        progress,
        badges,
        isLoading,
        apiError,
        completeMission,
        startMission,
        resetProgress,
        unlockAllMissionsForDemo,
        getMissionStatus,
        getMissionScore,
        hasBadge,
        totalXp,
        rankTitle,
        refreshProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
