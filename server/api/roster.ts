import { db } from '../db.ts';
import type { DbStudent } from '../db.ts';
import { detectPIIViolation, sanitizeString } from '../middleware/coppaGuard.ts';

export function handleGetRoster(classCode: string | null): { status: number; data: any } {
  const code = (classCode || 'NASA-CADET-5A').trim().toUpperCase();

  const database = db.read();
  const students = database.students.filter(s => s.classCode === code);

  // Compute live aggregates from database records
  const totalStudents = students.length;
  const activeNow = students.filter(s => s.status === 'active').length;
  const totalScoreSum = students.reduce((acc, curr) => acc + curr.totalScore, 0);
  const avgScore = totalStudents > 0 ? Math.round(totalScoreSum / totalStudents) : 0;
  const totalBadges = students.reduce((acc, curr) => acc + curr.badgesCount, 0);

  // NGSS mastery: proportion of cadets who have cleared >= 2 standards
  const masteredCount = students.filter(s => s.standardsMastered.length >= 2).length;
  const masteryRate = totalStudents > 0 ? Math.round((masteredCount / totalStudents) * 100) : 0;

  return {
    status: 200,
    data: {
      classCode: code,
      metrics: {
        enrolledCadets: totalStudents,
        activeNow,
        classAvgScore: avgScore,
        badgesConferred: totalBadges,
        masteryRate
      },
      students
    }
  };
}

export function handleEnrollCadet(body: unknown): { status: number; data: any } {
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
      data: {
        error: 'COPPA_VIOLATION',
        message: `Field '${piiViolation}' is forbidden under COPPA. No personal data allowed.`
      }
    };
  }

  const { id, nickname, callsign, avatar, ageGroup, classCode } = body as {
    id?: string;
    nickname?: string;
    callsign?: string;
    avatar?: string;
    ageGroup?: string;
    classCode?: string;
  };

  if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
    return {
      status: 400,
      data: { error: 'INVALID_NICKNAME', message: 'Nickname must be at least 2 characters long.' }
    };
  }

  if (nickname.trim().length > 20) {
    return {
      status: 400,
      data: { error: 'INVALID_NICKNAME', message: 'Nickname cannot exceed 20 characters.' }
    };
  }

  const sanitizedNickname = sanitizeString(nickname);
  const sanitizedCallsign = sanitizeString(callsign || 'CADET-PILOT').toUpperCase();
  const validClassCode = sanitizeString(classCode || 'NASA-CADET-5A').toUpperCase();
  const safeId = sanitizeString(id || `cadet-${Date.now()}`);

  const database = db.read();
  let student = database.students.find(s => s.id === safeId);

  if (student) {
    student.nickname = sanitizedNickname;
    student.callsign = sanitizedCallsign;
    student.avatar = avatar || student.avatar;
    student.classCode = validClassCode;
    student.lastActive = 'Just now';
  } else {
    student = {
      id: safeId,
      nickname: sanitizedNickname,
      callsign: sanitizedCallsign,
      avatar: avatar || '👨‍🚀',
      classCode: validClassCode,
      ageGroup: ageGroup || '8-10',
      consentGranted: true,
      missionsCompleted: 0,
      totalScore: 0,
      badgesCount: 0,
      currentMission: 'Rocket Launch & Return',
      status: 'active',
      lastActive: 'Just now',
      standardsMastered: ['NGSS-5-PS2-1']
    };
    database.students.push(student);
  }

  db.write(database);

  return {
    status: 200,
    data: {
      success: true,
      student
    }
  };
}
