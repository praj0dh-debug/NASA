// Okabe-Ito colorblind-safe palette (W3C / Nature Methods standard)
export const OkabeIto = {
  black: '#000000',
  orange: '#E69F00',
  skyBlue: '#56B4E9',
  bluishGreen: '#009E73',
  yellow: '#F0E442',
  blue: '#0072B2',
  vermilion: '#D55E00',
  reddishPurple: '#CC79A7',
  white: '#FFFFFF',
  grey: '#999999'
};

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  colorblindMode: boolean; // Enables Okabe-Ito styling borders & patterns
  audioNarration: boolean;
  reduceMotion: boolean;
  soundEffects: boolean;
}

export const defaultA11ySettings: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  colorblindMode: false,
  audioNarration: false,
  reduceMotion: false,
  soundEffects: true
};

