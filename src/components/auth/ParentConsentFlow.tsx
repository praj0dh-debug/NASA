import React, { useState } from 'react';
import { ShieldCheck, Mail, CheckCircle2, Lock, School, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { apiClient, ApiError } from '../../lib/apiClient';

interface ParentConsentFlowProps {
  onConsentApproved: (email: string) => void;
  onCancel: () => void;
  studentId?: string;
}

export const ParentConsentFlow: React.FC<ParentConsentFlowProps> = ({
  onConsentApproved,
  onCancel,
  studentId
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [checkedCOPPA, setCheckedCOPPA] = useState(false);
  const [checkedEducational, setCheckedEducational] = useState(false);

  // Field-specific validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [coppaError, setCoppaError] = useState<string | null>(null);
  const [eduError, setEduError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setCoppaError(null);
    setEduError(null);
    setServerError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('An adult supervisor email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address format (e.g. adult@school.edu).');
      isValid = false;
    }

    if (!checkedCOPPA) {
      setCoppaError('Confirmation of zero-PII retention is required under federal COPPA rules.');
      isValid = false;
    }

    if (!checkedEducational) {
      setEduError('Educational STEM simulator participation consent must be confirmed.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await apiClient.submitConsent({
        email: email.trim().toLowerCase(),
        role,
        coppaConfirmed: checkedCOPPA,
        educationalConfirmed: checkedEducational,
        studentId
      });

      setIsSuccess(true);
      setTimeout(() => {
        onConsentApproved(response.verifiedEmail || email.trim().toLowerCase());
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Network error while recording consent. Operating with offline fallback pass.');
        // Fallback for offline mode
        setTimeout(() => {
          onConsentApproved(email.trim().toLowerCase());
        }, 1200);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="coppa-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="max-w-md w-full bg-space-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h2 id="coppa-dialog-title" className="text-xl font-black text-white font-display mb-1">
          COPPA & Educational Consent Gate
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The Children's Online Privacy Protection Act requires verified adult consent before minor students or cadets initialize space simulator flight accounts.
        </p>

        {serverError && (
          <div className="p-3 mb-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Consent Verified</h3>
            <p className="text-xs text-slate-300">Granting zero-PII student flight pass...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              <label htmlFor="consent-email" className="block text-xs font-semibold text-slate-300 mb-1">
                {role === 'parent' ? "Parent / Guardian Email" : "Teacher School Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="consent-email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="adult.guardian@school.edu"
                  disabled={isSubmitting}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'consent-email-error' : undefined}
                  className={`w-full bg-space-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 ${
                    emailError ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-700 focus:border-emerald-400 focus:ring-emerald-400'
                  }`}
                />
              </div>
              {emailError && (
                <p id="consent-email-error" className="text-[11px] text-rose-400 mt-1 font-medium">{emailError}</p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedCOPPA}
                    onChange={e => {
                      setCheckedCOPPA(e.target.checked);
                      if (coppaError) setCoppaError(null);
                    }}
                    disabled={isSubmitting}
                    className="mt-0.5 rounded border-slate-700 bg-space-950 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>I confirm that no personal data (full name, phone, address, photo) will ever be required for this student.</span>
                </label>
                {coppaError && (
                  <p className="text-[11px] text-rose-400 ml-6 mt-1 font-medium">{coppaError}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedEducational}
                    onChange={e => {
                      setCheckedEducational(e.target.checked);
                      if (eduError) setEduError(null);
                    }}
                    disabled={isSubmitting}
                    className="mt-0.5 rounded border-slate-700 bg-space-950 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>I authorize participation in STEM spaceflight simulation exercises aligned with NGSS standards.</span>
                </label>
                {eduError && (
                  <p className="text-[11px] text-rose-400 ml-6 mt-1 font-medium">{eduError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={isSubmitting}
                className="flex-1"
                icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Verifying...' : 'Approve Flight Pass'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
