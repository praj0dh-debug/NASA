// Speech Narrator using browser SpeechSynthesis API

class SpaceSpeechNarrator {
  public enabled: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  speak(text: string, onEnd?: () => void) {
    if (!this.enabled || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Friendly mentor pitch
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }
}

export const speechNarrator = new SpaceSpeechNarrator();

