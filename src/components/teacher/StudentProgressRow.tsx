import React from 'react';
import { Award, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface StudentRecord {
  id: string;
  nickname: string;
  callsign: string;
  avatar: string;
  missionsCompleted: number;
  totalScore: number;
  badgesCount: number;
  currentMission: string;
  status: 'active' | 'stuck' | 'completed';
  lastActive: string;
  standardsMastered: string[];
}

interface StudentProgressRowProps {
  student: StudentRecord;
  onInspect: (student: StudentRecord) => void;
}

export const StudentProgressRow: React.FC<StudentProgressRowProps> = ({ student, onInspect }) => {
  return (
    <tr className="border-b border-slate-800/80 hover:bg-space-850/60 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl p-1.5 bg-space-800 rounded-xl border border-slate-700/60 shrink-0">
            {student.avatar}
          </span>
          <div>
            <div className="font-bold text-white text-sm">{student.nickname}</div>
            <div className="text-[11px] font-mono text-sky-400 font-semibold">{student.callsign}</div>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-center">
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-space-800 border border-slate-700 text-slate-200">
          {student.missionsCompleted} / 6
        </span>
      </td>

      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-sm">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{student.badgesCount}</span>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="text-xs text-slate-300 font-medium">{student.currentMission}</div>
        <div className="text-[11px] text-slate-500">{student.lastActive}</div>
      </td>

      <td className="py-3 px-4 text-center">
        {student.status === 'completed' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> All Cleared
          </span>
        )}
        {student.status === 'active' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Clock className="w-3 h-3" /> In Flight
          </span>
        )}
        {student.status === 'stuck' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" /> Needs Help
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onInspect(student)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline px-2 py-1 rounded hover:bg-space-800 transition-colors"
        >
          View Telemetry
        </button>
      </td>
    </tr>
  );
};

