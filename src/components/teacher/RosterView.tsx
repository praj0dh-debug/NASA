import React, { useState, useEffect, useCallback } from 'react';
import { Users, School, ShieldCheck, Download, Plus, Filter, Sparkles, BookOpen, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { StudentProgressRow, StudentRecord } from './StudentProgressRow';
import { Button } from '../common/Button';
import { apiClient } from '../../lib/apiClient';
import ngssStandards from '../../data/standards/ngss.json';

export const RosterView: React.FC = () => {
  const [classCode, setClassCode] = useState<string>('NASA-CADET-5A');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [metrics, setMetrics] = useState({
    enrolledCadets: 0,
    activeNow: 0,
    classAvgScore: 0,
    badgesConferred: 0,
    masteryRate: 0
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'stuck' | 'completed'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // New Class Code Input
  const [isChangingClass, setIsChangingClass] = useState<boolean>(false);
  const [inputClassCode, setInputClassCode] = useState<string>(classCode);
  const [classCodeError, setClassCodeError] = useState<string | null>(null);

  const fetchRosterData = useCallback(async (code: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.getRoster(code);
      setStudents(res.students || []);
      if (res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      const error = err as Error;
      setErrorMsg(`Failed to load flight roster: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRosterData(classCode);
  }, [classCode, fetchRosterData]);

  const handleApplyClassCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputClassCode.trim().toUpperCase();
    if (trimmed.length < 3) {
      setClassCodeError('Class code must be at least 3 characters.');
      return;
    }
    if (!/^[A-Z0-9-]+$/.test(trimmed)) {
      setClassCodeError('Class code can only contain letters, numbers, and hyphens.');
      return;
    }
    setClassCodeError(null);
    setClassCode(trimmed);
    setIsChangingClass(false);
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Cadet ID', 'Callsign', 'Nickname', 'Missions Completed', 'Total Score', 'Badges', 'Status', 'Standards Mastered'];
    const rows = students.map(s => [
      s.id,
      s.callsign,
      s.nickname,
      s.missionsCompleted,
      s.totalScore,
      s.badgesCount,
      s.status,
      `"${s.standardsMastered.join(', ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NASA_Roster_${classCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-2 sm:px-0">
      {/* Dashboard Top Banner */}
      <section aria-label="Educator Dashboard Overview" className="bg-gradient-to-r from-space-900 via-indigo-950/70 to-space-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                CLASS CODE: {classCode}
              </span>
              <button
                onClick={() => setIsChangingClass(!isChangingClass)}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline focus:outline-none focus:ring-2 focus:ring-sky-400 rounded px-1"
              >
                {isChangingClass ? 'Cancel' : 'Change Code'}
              </button>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                COPPA RLS Active
              </span>
            </div>

            {isChangingClass && (
              <form onSubmit={handleApplyClassCode} className="mt-3 mb-2 flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputClassCode}
                    onChange={e => {
                      setInputClassCode(e.target.value);
                      setClassCodeError(null);
                    }}
                    placeholder="e.g. NASA-CADET-4B"
                    className="w-full bg-space-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  {classCodeError && (
                    <p className="text-[11px] text-rose-400 mt-1 font-sans">{classCodeError}</p>
                  )}
                </div>
                <Button type="submit" variant="primary" size="sm">
                  Load Class
                </Button>
              </form>
            )}

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
              onClick={handleExportCSV}
              disabled={students.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section aria-label="Class Metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Cadets</div>
          <div className="text-3xl font-black text-white font-mono mt-1">
            {isLoading ? <span className="opacity-40 animate-pulse">--</span> : metrics.enrolledCadets}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">{metrics.activeNow} active in flight</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Avg Score</div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-1">
            {isLoading ? <span className="opacity-40 animate-pulse">--</span> : `${metrics.classAvgScore}%`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across completed debriefs</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Badges Conferred</div>
          <div className="text-3xl font-black text-sky-400 font-mono mt-1">
            {isLoading ? <span className="opacity-40 animate-pulse">--</span> : metrics.badgesConferred}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">NASA certified credentials</div>
        </div>

        <div className="bg-space-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">NGSS Mastery Rate</div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
            {isLoading ? <span className="opacity-40 animate-pulse">--</span> : `${metrics.masteryRate}%`}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">2+ standards mastered</div>
        </div>
      </section>

      {/* Roster Table Section */}
      <section aria-label="Student Roster" className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Live Flight Roster ({classCode})</span>
            </h2>
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

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing telemetry data from classroom network...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="p-6 my-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">Telemetry Feed Error</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMsg}</p>
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => fetchRosterData(classCode)}
            >
              Retry Telemetry Link
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMsg && filteredStudents.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-space-800 border border-slate-700 flex items-center justify-center mx-auto text-2xl">
              🛰️
            </div>
            <h3 className="text-base font-bold text-white">No Cadets Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filter === 'all'
                ? `No cadets are currently enrolled in class code '${classCode}'. Students can enter this code in their profile setup to link automatically.`
                : `No cadets currently match the '${filter}' filter status.`}
            </p>
          </div>
        )}

        {/* Real Table */}
        {!isLoading && !errorMsg && filteredStudents.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Cadet Callsign</th>
                  <th scope="col" className="py-3 px-4 text-center">Missions</th>
                  <th scope="col" className="py-3 px-4 text-center">Badges</th>
                  <th scope="col" className="py-3 px-4">Current Vector</th>
                  <th scope="col" className="py-3 px-4 text-center">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Actions</th>
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
        )}
      </section>

      {/* NGSS Standards Alignment Matrix */}
      <section aria-label="Curriculum Standards" className="bg-space-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Curriculum Standards Coverage (NGSS & CSTA)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ngssStandards.map(std => (
            <div key={std.code} className="bg-space-950/70 border border-slate-800/80 rounded-2xl p-4">
              <div className="text-xs font-mono font-bold text-sky-400 mb-1">{std.code}</div>
              <h3 className="text-sm font-bold text-white mb-1.5">{std.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{std.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Telemetry Inspection Modal */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-cadet-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-space-900 border border-sky-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl p-2 bg-space-800 rounded-2xl" aria-hidden="true">{selectedStudent.avatar}</span>
              <div>
                <h3 id="inspect-cadet-title" className="font-bold text-lg text-white">{selectedStudent.nickname}</h3>
                <div className="text-xs font-mono text-sky-400 font-bold">{selectedStudent.callsign}</div>
              </div>
            </div>

            <div className="space-y-3 bg-space-950 p-4 rounded-2xl border border-slate-800 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Class Wing:</span>
                <span className="font-mono font-bold text-white">{classCode}</span>
              </div>
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
                <span className="text-slate-400">Current Vector:</span>
                <span className="text-slate-200">{selectedStudent.currentMission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Telemetry:</span>
                <span className="text-slate-300">{selectedStudent.lastActive}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Mastered Standards:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedStudent.standardsMastered.map(std => (
                    <span key={std} className="px-1.5 py-0.5 bg-sky-950 border border-sky-800 rounded text-[10px] font-mono text-sky-300">
                      {std}
                    </span>
                  ))}
                </div>
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
