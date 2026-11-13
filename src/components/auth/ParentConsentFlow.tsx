import React, { useState } from 'react';
import { ShieldCheck, Mail, CheckCircle2, Lock, School } from 'lucide-react';
import { Button } from '../common/Button';

interface ParentConsentFlowProps {
  onConsentApproved: (email: string) => void;
  onCancel: () => void;
}

export const ParentConsentFlow: React.FC<ParentConsentFlowProps> = ({
  onConsentApproved,
  onCancel
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [checkedCOPPA, setCheckedCOPPA] = useState(false);
  const [checkedEducational, setCheckedEducational] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && checkedCOPPA && checkedEducational) {
      setIsSent(true);
      setTimeout(() => {
        onConsentApproved(email);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-md w-full bg-space-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-white font-display mb-1">
          COPPA & Educational Consent Gate
        </h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The Children's Online Privacy Protection Act requires verified adult consent before minor students or cadets initialize space simulator flight accounts.
        </p>

        {isSent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Consent Verified</h4>
            <p className="text-xs text-slate-300">Granting zero-PII student flight pass...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adult Supervisor Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'parent'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-space-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Parent / Guardian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-space-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Educator / School</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {role === 'parent' ? "Parent / Guardian Email" : "Teacher School Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="adult.guardian@school.edu"
                  required
                  className="w-full bg-space-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedCOPPA}
                  onChange={e => setCheckedCOPPA(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-space-950 text-emerald-500 focus:ring-emerald-400"
                  required
                />
                <span>I confirm that no personal data (full name, phone, address, photo) will ever be required for this student.</span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedEducational}
                  onChange={e => setCheckedEducational(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-space-950 text-emerald-500 focus:ring-emerald-400"
                  required
                />
                <span>I authorize participation in STEM spaceflight simulation exercises aligned with NGSS standards.</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={!email || !checkedCOPPA || !checkedEducational}
                className="flex-1"
              >
                Approve Flight Pass
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

