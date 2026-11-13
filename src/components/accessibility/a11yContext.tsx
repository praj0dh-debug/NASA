import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilitySettings, defaultA11ySettings } from '../../utils/colorPalettes';
import { soundEffects } from '../../lib/soundEffects';
import { speechNarrator } from '../../lib/speechNarrator';

interface A11yContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  toggleHighContrast: () => void;
  toggleAudioNarration: () => void;
  toggleSoundEffects: () => void;
  setTextSize: (size: AccessibilitySettings['textSize']) => void;
  speakNarration: (text: string) => void;
  stopNarration: () => void;
}

const STORAGE_KEY = 'junior_astronaut_a11y_v1';

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const A11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultA11ySettings, ...JSON.parse(saved) } : defaultA11ySettings;
    } catch {
      return defaultA11ySettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    soundEffects.enabled = settings.soundEffects;
    speechNarrator.enabled = settings.audioNarration;

    // Apply classes to root element for global styling
    const root = document.documentElement;
    if (settings.highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }

    if (settings.colorblindMode) {
      root.classList.add('a11y-colorblind');
    } else {
      root.classList.remove('a11y-colorblind');
    }

    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xl');
    root.classList.add(`text-size-${settings.textSize}`);
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleAudioNarration = () => {
    setSettings(prev => {
      const newVal = !prev.audioNarration;
      speechNarrator.enabled = newVal;
      if (!newVal) speechNarrator.stop();
      return { ...prev, audioNarration: newVal };
    });
  };

  const toggleSoundEffects = () => {
    setSettings(prev => {
      const newVal = !prev.soundEffects;
      soundEffects.enabled = newVal;
      return { ...prev, soundEffects: newVal };
    });
  };

  const setTextSize = (textSize: AccessibilitySettings['textSize']) => {
    setSettings(prev => ({ ...prev, textSize }));
  };

  const speakNarration = (text: string) => {
    if (settings.audioNarration) {
      speechNarrator.speak(text);
    }
  };

  const stopNarration = () => {
    speechNarrator.stop();
  };

  return (
    <A11yContext.Provider
      value={{
        settings,
        updateSettings,
        toggleHighContrast,
        toggleAudioNarration,
        toggleSoundEffects,
        setTextSize,
        speakNarration,
        stopNarration
      }}
    >
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};

