import { db } from '../db.ts';
import type { DbBadgeRecord } from '../db.ts';
import { detectPIIViolation } from '../middleware/coppaGuard.ts';

const VALID_BADGES: Record<string, string> = {
  'rocket-engineer': 'rocket-launch',
  'station-commander': 'space-station',
  'lunar-geologist': 'lunar-exploration',
  'rover-navigator': 'mars-rover-code',
  'orbit-architect': 'satellite-design',
  'planetary-defender': 'asteroid-deflection'
};

export function handleGetBadges(profileId: string | null): { status: number; data: any } {
  if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
    return {
      status: 400,
      data: { error: 'MISSING_PROFILE_ID', message: 'A valid profileId query parameter is required.' }
    };
  }

  const database = db.read();
  const badges = database.badges[profileId] || [];

  return {
    status: 200,
    data: {
      profileId,
      badges
    }
  };
}

export function handlePostBadge(body: unknown): { status: number; data: any } {
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

  const { profileId, badgeId, missionId, score } = body as {
    profileId?: string;
    badgeId?: string;
    missionId?: string;
    score?: number;
  };

  if (!profileId || typeof profileId !== 'string' || profileId.trim().length < 3) {
    return {
      status: 400,
      data: { error: 'INVALID_PROFILE_ID', message: 'profileId must be a valid string.' }
    };
  }

  if (!badgeId || typeof badgeId !== 'string' || !VALID_BADGES[badgeId]) {
    return {
      status: 400,
      data: {
        error: 'INVALID_BADGE_ID',
        message: `badgeId must be one of: ${Object.keys(VALID_BADGES).join(', ')}`
      }
    };
  }

  const expectedMission = VALID_BADGES[badgeId];
  if (missionId !== expectedMission) {
    return {
      status: 400,
      data: {
        error: 'MISSION_MISMATCH',
        message: `Badge '${badgeId}' corresponds to mission '${expectedMission}', not '${missionId}'.`
      }
    };
  }

  if (typeof score !== 'number' || score < 70) {
    return {
      status: 400,
      data: {
        error: 'INSUFFICIENT_SCORE',
        message: 'A minimum mastery score of 70% is required to earn NASA mission certification.'
      }
    };
  }

  const database = db.read();
  if (!database.badges[profileId]) {
    database.badges[profileId] = [];
  }

  const existing = database.badges[profileId].find(b => b.badgeId === badgeId);
  if (existing) {
    return {
      status: 200,
      data: {
        success: true,
        alreadyEarned: true,
        badge: existing,
        message: 'Badge already conferred previously.'
      }
    };
  }

  const newBadge: DbBadgeRecord = {
    badgeId,
    earnedAt: new Date().toISOString(),
    missionId: expectedMission,
    score: Math.round(score)
  };

  database.badges[profileId].push(newBadge);

  // Update student badge count in roster
  const student = database.students.find(s => s.id === profileId);
  if (student) {
    student.badgesCount = database.badges[profileId].length;
  }

  db.write(database);

  return {
    status: 201,
    data: {
      success: true,
      newlyAwarded: true,
      badge: newBadge,
      message: `NASA Artemis certification '${badgeId}' successfully conferred!`
    }
  };
}
