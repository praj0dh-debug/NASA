import React, { useState } from 'react';
import { Rocket, ShieldCheck, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { useUser, CadetProfile } from '../../context/UserContext';
import { Button } from '../common/Button';
import { apiClient } from '../../lib/apiClient';

interface ChildProfileSetupProps {
  onComplete: () => void;
}

const AVATARS = ['👨‍🚀', '👩‍🚀', '🚀', '🛸', '🪐', '🤖', '🛰️', '🌠'];
const CALLSIGNS = [
  'NOVA-1',
  'STAR-SEEKER',
  'COSMO-KID',
  'ORION-BLAST',
  'GALAXY-RUNNER',
  'POLARIS-PILOT',
  'APOLLO-PULSE',
  'NEBULA-SCOUT'
];

export const ChildProfileSetup: React.FC<ChildProfileSetupProps> = ({ onComplete }) => {
  const { setProfile, profile } = useUser();
  const [nickname, setNickname] = useState(profile?.nickname || 'Cadet Nova');
  const [callsign, setCallsign] = useState(profile?.callsign || 'STAR-SEEKER');
  const [avatar, setAvatar] = useState(profile?.avatar || '👨‍🚀');
  const [ageGroup, setAgeGroup] = useState<'5-7' | '8-10' | '11+'>(profile?.ageGroup || '8-10');
  const [classCode, setClassCode] = useState(profile?.classCode || 'NASA-CADET-5A');

  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [classCodeError, setClassCodeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setNicknameError(null);
    setClassCodeError(null);

    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('Astronaut nickname cannot be blank.');
      valid = false;
    } else if (trimmed.length < 2) {
      setNicknameError('Nickname must be at least 2 characters.');
      valid = false;
    } else if (trimmed.length > 18) {
      setNicknameError('Nickname cannot exceed 18 characters.');
      valid = false;
    } else if (/\d{7,}/.test(trimmed)) {
      setNicknameError('For safety under COPPA, do not include phone numbers or digits.');
      valid = false;
    }

    const trimmedCode = classCode.trim();
    if (trimmedCode && !/^[A-Za-z0-9-]+$/.test(trimmedCode)) {
      setClassCodeError('Class code can only contain letters, numbers, and hyphens.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);

    const safeId = profile?.id || `cadet-${Date.now()}`;
    const cleanNickname = nickname.trim();
    const cleanClassCode = (classCode.trim() || 'NASA-CADET-5A').toUpperCase();

    const newProfile: CadetProfile = {
      id: safeId,
      nickname: cleanNickname,
      callsign,
      avatar,
      ageGroup,
      classCode: cleanClassCode,
      consentGranted: true,
      role: 'cadet',
      createdAt: profile?.createdAt || new Date().toISOString()
    };

    setProfile(newProfile);

    // Sync to backend roster
    try {
      await apiClient.enrollCadet({
        id: safeId,
        nickname: cleanNickname,
        callsign,
        avatar,
        classCode: cleanClassCode,
        ageGroup
      });
    } catch {
      // Offline fallback already stored in UserContext
    } finally {
      setIsSubmitting(false);
      onComplete();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadet-badge-title"
      className="max-w-xl mx-auto bg-space-900 border-2 border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-left"
    >
      {/* COPPA badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold w-fit mb-4">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        <span>COPPA Compliant: Nicknames Only & Zero Personal Data Collected</span>
      </div>

      <div className="mb-6">
        <h2 id="cadet-badge-title" className="text-2xl font-black text-white font-display flex items-center gap-2">
          <span>Cadet Identification Badge</span>
          <Sparkles className="w-5 h-5 text-amber-400" aria-hidden="true" />
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customize your space flight suit, callsign, and training tier before liftoff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Avatar Selection */}
        <fieldset>
          <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Choose Your Space Avatar
          </legend>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {AVATARS.map(av => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                aria-label={`Select avatar ${av}`}
                aria-pressed={avatar === av}
                className={`text-2xl p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  avatar === av
                    ? 'bg-sky-500/20 border-sky-400 scale-110 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400'
                    : 'bg-space-800 border-slate-700 hover:border-slate-500 hover:scale-105'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Nickname input */}
        <div>
          <label htmlFor="cadet-nickname" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Astronaut Nickname
          </label>
          <input
            id="cadet-nickname"
            type="text"
            maxLength={18}
            value={nickname}
            onChange={e => {
              setNickname(e.target.value);
              if (nicknameError) setNicknameError(null);
            }}
            placeholder="e.g. Cadet Stella"
            aria-invalid={!!nicknameError}
            aria-describedby={nicknameError ? 'cadet-nickname-error' : undefined}
            className={`w-full bg-space-950 border rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 ${
              nicknameError ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-700 focus:border-sky-400 focus:ring-sky-400/20'
            }`}
          />
          {nicknameError && (
            <p id="cadet-nickname-error" className="text-xs text-rose-400 mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{nicknameError}</span>
            </p>
          )}
        </div>

        {/* Tactical Callsign */}
        <fieldset>
          <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mission Radio Callsign
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CALLSIGNS.map(cs => (
              <button
                key={cs}
                type="button"
                onClick={() => setCallsign(cs)}
                aria-pressed={callsign === cs}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer truncate ${
                  callsign === cs
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-space-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cs}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Class Code */}
        <div>
          <label htmlFor="cadet-class-code" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            School / Wing Class Code
          </label>
          <input
            id="cadet-class-code"
            type="text"
            maxLength={16}
            value={classCode}
            onChange={e => {
              setClassCode(e.target.value.toUpperCase());
              if (classCodeError) setClassCodeError(null);
            }}
            placeholder="e.g. NASA-CADET-5A"
            aria-invalid={!!classCodeError}
            aria-describedby={classCodeError ? 'cadet-class-code-error' : undefined}
            className={`w-full bg-space-950 border rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 ${
              classCodeError ? 'border-rose-500 focus:ring-rose-400' : 'border-slate-700 focus:border-sky-400 focus:ring-sky-400/20'
            }`}
          />
          {classCodeError && (
            <p id="cadet-class-code-error" className="text-xs text-rose-400 mt-1 font-medium">{classCodeError}</p>
          )}
        </div>

        {/* Age / Training Tier */}
        <fieldset>
          <legend className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Training Academy Level (Age Group)
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: '5-7', label: 'Junior Cadet (5-7)', desc: 'Simplified physics & heavy voiceover' },
              { id: '8-10', label: 'Flight Cadet (8-10)', desc: 'Standard engineering simulation loop' },
              { id: '11+', label: 'Senior Pilot (11+)', desc: 'Advanced orbital mechanics telemetry' },
            ].map(tier => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setAgeGroup(tier.id as '5-7' | '8-10' | '11+')}
                aria-pressed={ageGroup === tier.id}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  ageGroup === tier.id
                    ? 'bg-indigo-600/20 border-indigo-400 text-indigo-200 ring-2 ring-indigo-400/40'
                    : 'bg-space-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="text-xs font-bold text-white mb-1">{tier.label}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{tier.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
            icon={<UserCheck className="w-5 h-5" />}
          >
            {isSubmitting ? 'Updating Flight Credentials...' : 'Confirm & Enter Flight Deck'}
          </Button>
        </div>
      </form>
    </div>
  );
};
