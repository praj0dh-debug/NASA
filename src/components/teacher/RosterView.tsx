import React, { useState } from 'react';
import { Users, School, ShieldCheck, Download, Plus, Filter, Sparkles, BookOpen } from 'lucide-react';
import { StudentProgressRow, StudentRecord } from './StudentProgressRow';
import { useUser } from '../../context/UserContext';
import { useProgress } from '../../context/ProgressContext';
import { Button } from '../common/Button';
import ngssStandards from '../../data/standards/ngss.json';

export const RosterView: React.FC = () => {
  const { profile } = useUser();
  const { progress, badges } = useProgress();
  const [filter, setFilter] = useState<'all' | 'active' | 'stuck' | 'completed'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Completed missions count for the current user
  const completedMissionsCount = Object.values(progress).filter(p => p.status === 'complete').length;

  const currentStudentUser: StudentRecord = {
    id: profile?.id || 'current-cadet',
    nickname: profile?.nickname || 'Cadet Nova',
    callsign: profile?.callsign || 'STAR-SEEKER',
    avatar: profile?.avatar || '👨‍🚀',
    missionsCompleted: completedMissionsCount,
    totalScore: Object.values(progress).reduce((acc, curr) => acc + curr.score, 0),
    badgesCount: badges.length,
    currentMission: completedMissionsCount === 6 ? 'All Missions Complete' : 'Rocket Launch & Return',
    status: completedMissionsCount === 6 ? 'completed' : 'active',
    lastActive: 'Just now (This Session)',
    standardsMastered: ['NGSS-5-PS2-1', 'NGSS-3-5-ETS1-1', 'NGSS-3-5-ETS1-2']
  };

  const mockStudents: StudentRecord[] = [
    currentStudentUser,
    {
      id: 'student-2',
      nickname: 'Cadet Maya',
      callsign: 'ORION-LEAD',
      avatar: '👩‍🚀',
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
      missionsCompleted: 6,
      totalScore: 590,
      badgesCount: 6,
      currentMission: 'Flight Academy Graduate',
      status: 'completed',
      lastActive: 'Yesterday',
      standardsMastered: ['NGSS-5-PS2-1', 'NGSS-3-5-ETS1-1', 'NGSS-3-5-ETS1-2', 'NGSS-3-5-ETS1-3', 'NGSS-1-ESS1-1', 'CSTA-1B-AP-10']
    }
  ];

  const filteredStudents = mockStudents.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-space-900 via-indigo-950/70 to-space-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                CLASS CODE: NASA-CADET-5A
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                COPPA RLS Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Educator Command Center & Roster
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track live student telemetry, identify where cadets are struggling with orbital physics, and export standards-aligned assessment portfolios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={() => alert("Simulated CSV Export: Roster and NGSS standard mastery scores saved!")}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Cadets</div>
          <div className="text-3xl font-black text-white font-mono mt-1">24</div>
          <div className="text-[11px] text-emerald-400 mt-1">5 actively simulating now</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Avg Score</div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">86.4%</div>
          <div className="text-[11px] text-slate-400 mt-1">+14% improvement after debriefs</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Badges Conferred</div>
          <div className="text-3xl font-black text-sky-400 font-mono mt-1">68</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 6 mission scenarios</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">NGSS Mastery Rate</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">91%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Exceeding Grade 3-5 benchmark</div>
        </div>
      </div>

      {/* Roster Table Section */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Live Flight Roster</span>
            </h3>
            <p className="text-xs text-slate-400">Zero personal data stored — students identified strictly by callsigns.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-space-950 p-1 rounded-xl border border-slate-800">
            {(['all', 'active', 'stuck', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-sky-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Cadet Callsign</th>
                <th className="py-3 px-4 text-center">Missions</th>
                <th className="py-3 px-4 text-center">Badges</th>
                <th className="py-3 px-4">Current Vector</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <StudentProgressRow
                  key={student.id}
                  student={student}
                  onInspect={s => setSelectedStudent(s)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NGSS Standards Alignment Matrix */}
      <div className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Curriculum Standards Coverage (NGSS & CSTA)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ngssStandards.map(std => (
            <div key={std.code} className="bg-space-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-sky-400 mb-1">{std.code}</div>
              <div className="text-sm font-bold text-white mb-1.5">{std.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{std.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-space-900 border border-sky-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl p-2 bg-space-800 rounded-2xl">{selectedStudent.avatar}</span>
              <div>
                <h4 className="font-bold text-lg text-white">{selectedStudent.nickname}</h4>
                <div className="text-xs font-mono text-sky-400">{selectedStudent.callsign}</div>
              </div>
            </div>

            <div className="space-y-3 bg-space-950 p-4 rounded-2xl border border-slate-800 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Score:</span>
                <span className="font-mono font-bold text-amber-400">{selectedStudent.totalScore} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Missions Completed:</span>
                <span className="font-mono font-bold text-white">{selectedStudent.missionsCompleted} / 6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Badges Awarded:</span>
                <span className="font-mono font-bold text-sky-300">{selectedStudent.badgesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Telemetry:</span>
                <span className="text-slate-300">{selectedStudent.lastActive}</span>
              </div>
            </div>

            <Button onClick={() => setSelectedStudent(null)} variant="primary" className="w-full">
              Close Inspection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

