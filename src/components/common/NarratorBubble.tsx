import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
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

  // If user has audioNarration turned on globally, also trigger on mount or change
  React.useEffect(() => {
    if (settings.audioNarration) {
      speakNarration(message);
    }
  }, [message, settings.audioNarration]);

  return (
    <div className={`relative flex items-start gap-3.5 bg-gradient-to-r from-space-900/95 via-space-850/95 to-blue-950/90 border border-sky-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md ${className}`}>
      {/* Mentor Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center text-2xl">
          <div className="w-full h-full bg-space-950 rounded-[14px] flex items-center justify-center">
            {avatar}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-space-950" title="Online" />
      </div>

      {/* Speech Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-sky-400 font-display">
              {title}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
              MISSION CONTROL
            </span>
          </div>

          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-space-800 transition-colors ${
              isPlaying ? 'text-sky-400 bg-sky-950/60 ring-2 ring-sky-400' : ''
            }`}
            title={isPlaying ? "Stop Voice Narration" : "Listen to Mission Briefing"}
            aria-label="Toggle voiceover narration"
          >
            {isPlaying ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-slate-200 text-sm leading-relaxed font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

