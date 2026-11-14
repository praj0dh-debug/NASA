import fs from 'node:fs';
import path from 'node:path';

export interface DbMissionProgress {
  missionId: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'complete';
  score: number;
  completedAt?: string;
  attempts: number;
}

export interface DbBadgeRecord {
  badgeId: string;
  earnedAt: string;
  missionId: string;
  score: number;
}

export interface DbConsentRecord {
  id: string;
  email: string;
  role: 'parent' | 'teacher';
  coppaConfirmed: boolean;
  educationalConfirmed: boolean;
  ipHash?: string;
  createdAt: string;
}

export interface DbStudent {
  id: string;
  nickname: string;
  callsign: string;
  avatar: string;
  classCode: string;
  ageGroup: string;
  consentGranted: boolean;
  parentEmail?: string;
  missionsCompleted: number;
  totalScore: number;
  badgesCount: number;
  currentMission: string;
  status: 'active' | 'stuck' | 'completed';
  lastActive: string;
  standardsMastered: string[];
}

export interface DatabaseSchema {
  consents: DbConsentRecord[];
  students: DbStudent[];
  progress: Record<string, Record<string, DbMissionProgress>>; // profileId -> (missionId -> progress)
  badges: Record<string, DbBadgeRecord[]>; // profileId -> badges[]
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_DB: DatabaseSchema = {
  consents: [
    {
      id: 'consent-admin-01',
      email: 'flight.director@nasa-stem.org',
      role: 'teacher',
      coppaConfirmed: true,
      educationalConfirmed: true,
      createdAt: '2026-11-01T00:00:00.000Z'
    }
  ],
  students: [
    {
      id: 'cadet-nova-001',
      nickname: 'Cadet Nova',
      callsign: 'STAR-SEEKER',
      avatar: '👨‍🚀',
      classCode: 'NASA-CADET-5A',
      ageGroup: '8-10',
      consentGranted: true,
      parentEmail: 'flight.director@nasa-stem.org',
      missionsCompleted: 1,
      totalScore: 88,
      badgesCount: 1,
      currentMission: 'Rocket Launch & Return',
      status: 'active',
      lastActive: 'Just now',
      standardsMastered: ['NGSS-5-PS2-1', 'NGSS-3-5-ETS1-1']
    },
    {
      id: 'student-2',
      nickname: 'Cadet Maya',
      callsign: 'ORION-LEAD',
      avatar: '👩‍🚀',
      classCode: 'NASA-CADET-5A',
      ageGroup: '8-10',
      consentGranted: true,
      parentEmail: 'maya.parent@example.com',
      missionsCompleted: 3,
      totalScore: 285,
      badgesCount: 3,
      currentMission: 'Mars Rover Autonomous Coding',
      status: 'active',
      lastActive: '4 mins ago',
      standardsMastered: ['NGSS-5-PS2-1', 'NGSS-1-ESS1-1']
    },
    {
      id: 'student-3',
      nickname: 'Cadet Leo',
      callsign: 'PULSAR-7',
      avatar: '🚀',
      classCode: 'NASA-CADET-5A',
      ageGroup: '8-10',
      consentGranted: true,
      parentEmail: 'leo.parent@example.com',
      missionsCompleted: 1,
      totalScore: 85,
      badgesCount: 1,
      currentMission: 'Orbital Space Station Life Support',
      status: 'stuck',
      lastActive: '8 mins ago',
      standardsMastered: ['NGSS-5-PS2-1']
    },
    {
      id: 'student-4',
      nickname: 'Cadet Liam',
      callsign: 'COSMO-X',
      avatar: '🪐',
      classCode: 'NASA-CADET-5A',
      ageGroup: '8-10',
      consentGranted: true,
      parentEmail: 'liam.parent@example.com',
      missionsCompleted: 5,
      totalScore: 480,
      badgesCount: 5,
      currentMission: 'Planetary Defense DART Simulator',
      status: 'active',
      lastActive: '12 mins ago',
      standardsMastered: ['NGSS-5-PS2-1', 'NGSS-3-5-ETS1-1', 'NGSS-3-5-ETS1-2', 'NGSS-4-ESS3-2']
    },
    {
      id: 'student-5',
      nickname: 'Cadet Zara',
      callsign: 'LUNAR-FOX',
      avatar: '🤖',
      classCode: 'NASA-CADET-5A',
      ageGroup: '8-10',
      consentGranted: true,
      parentEmail: 'zara.parent@example.com',
      missionsCompleted: 6,
      totalScore: 590,
      badgesCount: 6,
      currentMission: 'Flight Academy Graduate',
      status: 'completed',
      lastActive: 'Yesterday',
      standardsMastered: ['NGSS-5-PS2-1', 'NGSS-3-5-ETS1-1', 'NGSS-3-5-ETS1-2', 'NGSS-3-5-ETS1-3', 'NGSS-1-ESS1-1', 'CSTA-1B-AP-10']
    }
  ],
  progress: {
    'cadet-nova-001': {
      'rocket-launch': { missionId: 'rocket-launch', status: 'unlocked', score: 88, completedAt: '2026-11-13T01:00:00.000Z', attempts: 1 },
      'space-station': { missionId: 'space-station', status: 'unlocked', score: 0, attempts: 0 },
      'lunar-exploration': { missionId: 'lunar-exploration', status: 'locked', score: 0, attempts: 0 },
      'mars-rover-code': { missionId: 'mars-rover-code', status: 'locked', score: 0, attempts: 0 },
      'satellite-design': { missionId: 'satellite-design', status: 'locked', score: 0, attempts: 0 },
      'asteroid-deflection': { missionId: 'asteroid-deflection', status: 'locked', score: 0, attempts: 0 }
    }
  },
  badges: {
    'cadet-nova-001': [
      {
        badgeId: 'rocket-engineer',
        earnedAt: '2026-11-13T01:00:00.000Z',
        missionId: 'rocket-launch',
        score: 88
      }
    ]
  }
};

class Database {
  private cache: DatabaseSchema | null = null;

  private ensureFile() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      this.cache = INITIAL_DB;
    }
  }

  read(): DatabaseSchema {
    this.ensureFile();
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache!;
    } catch {
      return INITIAL_DB;
    }
  }

  write(data: DatabaseSchema): void {
    this.ensureFile();
    this.cache = data;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }
}

export const db = new Database();
