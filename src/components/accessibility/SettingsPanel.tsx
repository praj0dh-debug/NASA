import React from 'react';
import { X, Eye, Volume2, Type, Sparkles, Shield, Palette } from 'lucide-react';
import { useA11y } from './a11yContext';
import { Button } from '../common/Button';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    toggleHighContrast,
    toggleAudioNarration,
    toggleSoundEffects,
    setTextSize
  } = useA11y();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-space-900 border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl overflow-hidden"
        role="dialog"
        aria-labelledby="a11y-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="a11y-title" className="text-lg font-bold text-white font-display">
                Accessibility & Mission Controls
              </h2>
              <p className="text-xs text-slate-400">WCAG 2.1 AA Compliant Display & Audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-space-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Text Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
              <Type className="w-4 h-4 text-sky-400" />
              <span>Reading Font Size</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xl'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                    settings.textSize === size
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/30'
                      : 'bg-space-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size === 'normal' && 'Standard'}
                  {size === 'large' && 'Large (120%)'}
                  {size === 'xl' && 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 bg-space-850 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>High Contrast Mode</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Increases border visibility and text contrast (WCAG AAA)
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.highContrast ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.highContrast}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Okabe-Ito Colorblind Safe Mode */}
          <div className="flex items-center justify-between p-3.5 bg-space-850 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Colorblind Assistance</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Adds high-distinction Okabe-Ito borders and tactile patterns
              </div>
            </div>
            <button
              onClick={() => updateSettings({ colorblindMode: !settings.colorblindMode })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.colorblindMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.colorblindMode}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.colorblindMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Narration (TTS Voiceover) */}
          <div className="flex items-center justify-between p-3.5 bg-space-850 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Voice Narration (Early Reader)</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Automatically speaks out mission instructions & explanations
              </div>
            </div>
            <button
              onClick={toggleAudioNarration}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.audioNarration ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.audioNarration}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.audioNarration ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 bg-space-850 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Mission Sound Effects</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Rocket engine rumble, telemetry beeps, and success chimes
              </div>
            </div>
            <button
              onClick={toggleSoundEffects}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEffects ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.soundEffects}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

