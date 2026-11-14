import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useA11y } from '../accessibility/a11yContext';
import { speechNarrator } from '../../lib/speechNarrator';

interface NarratorBubbleProps {
  message: string;
  title?: string;
  avatar?: string;
  emotion?: 'happy' | 'alert' | 'curious' | 'celebrating';
  onDismiss?: () => void;
  className?: string;
}

export const NarratorBubble: React.FC<NarratorBubbleProps> = ({
  message,
  title = "Flight Director Vega",
  avatar = "👩‍🚀",
  emotion = 'happy',
  className = ''
}) => {
  const { settings, speakNarration } = useA11y();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if (isPlaying) {
      speechNarrator.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speechNarrator.speak(message, () => setIsPlaying(false));
    }
  };

  React.useEffect(() => {
    if (settings.audioNarration) {
      speakNarration(message);
    }
  }, [message, settings.audioNarration]);

  return (
    <div className={`relative flex items-start gap-4 bg-[#12153f]/90 border border-[#2e336d]/70 rounded-2xl p-4 shadow-xl backdrop-blur-xl ${className}`}>
      {/* Mentor Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-400 p-0.5 shadow-md flex items-center justify-center text-xl">
          <div className="w-full h-full bg-[#0a0b2e] rounded-[10px] flex items-center justify-center">
            {avatar}
          </div>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-[#0a0b2e]" title="Online" />
      </div>

      {/* Speech Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-purple-300">
              {title}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#0a0b2e] text-slate-400 border border-[#1f245c]">
              MISSION BRIEFING
            </span>
          </div>

          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${
              isPlaying ? 'text-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-400' : ''
            }`}
            title={isPlaying ? "Stop Voice Narration" : "Listen to Mission Briefing"}
            aria-label="Toggle voiceover narration"
          >
            {isPlaying ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};
