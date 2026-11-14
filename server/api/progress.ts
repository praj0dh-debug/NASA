import { db } from '../db.ts';
import type { DbMissionProgress } from '../db.ts';
import { detectPIIViolation } from '../middleware/coppaGuard.ts';

const VALID_MISSIONS = [
  'rocket-launch',
  'space-station',
  'lunar-exploration',
  'mars-rover-code',
  'satellite-design',
  'asteroid-deflection'
];

const MISSION_UNLOCK_ORDER: Record<string, string> = {
  'rocket-launch': 'space-station',
  'space-station': 'lunar-exploration',
  'lunar-exploration': 'mars-rover-code',
  'mars-rover-code': 'satellite-design',
  'satellite-design': 'asteroid-deflection'
};

export function handleGetProgress(profileId: string | null): { status: number; data: any } {
  if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
    return {
      status: 400,
      data: { error: 'MISSING_PROFILE_ID', message: 'A valid cadet profile ID must be supplied in query params.' }
    };
  }

  const database = db.read();
  const cadetProgress = database.progress[profileId] || {};

  // Ensure default baseline
  const responseProgress: Record<string, DbMissionProgress> = {};
  for (const mId of VALID_MISSIONS) {
    if (cadetProgress[mId]) {
      responseProgress[mId] = cadetProgress[mId];
    } else {
      responseProgress[mId] = {
        missionId: mId,
        status: mId === 'rocket-launch' ? 'unlocked' : 'locked',
        score: 0,
        attempts: 0
      };
    }
  }

  return {
    status: 200,
    data: {
      profileId,
      progress: responseProgress
    }
  };
}

export function handlePostProgress(body: unknown): { status: number; data: any } {
  if (!body || typeof body !== 'object') {
    return {
      status: 400,
      data: { error: 'INVALID_REQUEST', message: 'Request body must be a valid JSON object.' }
    };
  }

  const piiViolation = detectPIIViolation(body);
  if (piiViolation) {
    return {
      status: 400,
      data: { error: 'COPPA_VIOLATION', message: `Field '${piiViolation}' is barred under COPPA.` }
    };
  }

  const { profileId, missionId, score, status, attempts } = body as {
    profileId?: string;
    missionId?: string;
    score?: number;
    status?: string;
    attempts?: number;
  };

  if (!profileId || typeof profileId !== 'string' || profileId.trim().length < 3) {
    return {
      status: 400,
      data: { error: 'INVALID_PROFILE_ID', message: 'profileId must be a non-empty string.' }
    };
  }

  if (!missionId || typeof missionId !== 'string' || !VALID_MISSIONS.includes(missionId)) {
    return {
      status: 400,
      data: {
        error: 'INVALID_MISSION_ID',
        message: `missionId must be one of: ${VALID_MISSIONS.join(', ')}`
      }
    };
  }

  if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
    return {
      status: 400,
      data: { error: 'INVALID_SCORE', message: 'score must be an integer between 0 and 100.' }
    };
  }

  const validStatuses = ['locked', 'unlocked', 'in_progress', 'complete'];
  if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
    return {
      status: 400,
      data: { error: 'INVALID_STATUS', message: `status must be one of: ${validStatuses.join(', ')}` }
    };
  }

  const database = db.read();
  if (!database.progress[profileId]) {
    database.progress[profileId] = {};
  }

  const current = database.progress[profileId][missionId] || {
    missionId,
    status: 'unlocked',
    score: 0,
    attempts: 0
  };

  const newAttempts = typeof attempts === 'number' && attempts > 0 ? attempts : current.attempts + 1;
  const newScore = Math.max(current.score, Math.round(score));

  database.progress[profileId][missionId] = {
    missionId,
    status: status as DbMissionProgress['status'],
    score: newScore,
    attempts: newAttempts,
    completedAt: status === 'complete' ? (current.completedAt || new Date().toISOString()) : current.completedAt
  };

  // Automatic next mission unlock if current mission completed
  let nextUnlocked: string | undefined;
  if (status === 'complete' && MISSION_UNLOCK_ORDER[missionId]) {
    const nextMissionId = MISSION_UNLOCK_ORDER[missionId];
    if (!database.progress[profileId][nextMissionId] || database.progress[profileId][nextMissionId].status === 'locked') {
      database.progress[profileId][nextMissionId] = {
        missionId: nextMissionId,
        status: 'unlocked',
        score: 0,
        attempts: 0
      };
      nextUnlocked = nextMissionId;
    }
  }

  // Update student aggregate record if present in roster
  const student = database.students.find(s => s.id === profileId);
  if (student) {
    const completedList = Object.values(database.progress[profileId]).filter(p => p.status === 'complete');
    student.missionsCompleted = completedList.length;
    student.totalScore = Object.values(database.progress[profileId]).reduce((acc, c) => acc + c.score, 0);
    student.lastActive = 'Just now';
    if (completedList.length === VALID_MISSIONS.length) {
      student.status = 'completed';
    }
  }

  db.write(database);

  return {
    status: 200,
    data: {
      success: true,
      updatedMission: database.progress[profileId][missionId],
      nextUnlockedMission: nextUnlocked
    }
  };
}
