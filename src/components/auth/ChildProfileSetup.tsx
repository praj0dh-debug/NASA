import React, { useState } from 'react';
import { Rocket, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useUser, CadetProfile } from '../../context/UserContext';
import { Button } from '../common/Button';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CadetProfile = {
      id: profile?.id || `cadet-${Date.now()}`,
      nickname: nickname.trim() || 'Astronaut Cadet',
      callsign,
      avatar,
      ageGroup,
      consentGranted: true,
      role: 'cadet',
      createdAt: profile?.createdAt || new Date().toISOString()
    };
    setProfile(newProfile);
    onComplete();
  };

  return (
    <div className="max-w-xl mx-auto bg-space-900 border-2 border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* COPPA badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold w-fit mb-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>COPPA Compliant: Nicknames Only & Zero Personal Data Collected</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
          <span>Cadet Identification Badge</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customize your space flight suit, callsign, and training tier before liftoff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Choose Your Space Avatar
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {AVATARS.map(av => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
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
        </div>

        {/* Nickname input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Astronaut Nickname
          </label>
          <input
            type="text"
            maxLength={18}
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="e.g. Cadet Stella"
            className="w-full bg-space-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            required
          />
        </div>

        {/* Tactical Callsign */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Mission Radio Callsign
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CALLSIGNS.map(cs => (
              <button
                key={cs}
                type="button"
                onClick={() => setCallsign(cs)}
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
        </div>

        {/* Age / Training Tier */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Training Academy Level (Age Group)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '5-7', label: 'Junior Cadet (Ages 5-7)', desc: 'Simplified physics & heavy voice narration' },
              { id: '8-10', label: 'Flight Cadet (Ages 8-10)', desc: 'Full engineering loop & interactive sims' },
              { id: '11+', label: 'Senior Pilot (Ages 11+)', desc: 'Real telemetry formulas & orbital math' },
            ].map(tier => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setAgeGroup(tier.id as '5-7' | '8-10' | '11+')}
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
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            icon={<UserCheck className="w-5 h-5" />}
          >
            Confirm & Enter Flight Deck
          </Button>
        </div>
      </form>
    </div>
  );
};

