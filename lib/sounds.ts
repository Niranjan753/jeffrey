// Sound effects system inspired by Endless Reader
// Uses Web Audio API for responsive, fun, playful sound effects
// Each letter has its own unique "voice" and personality!

type SoundType = 
  | 'pop' 
  | 'boing' 
  | 'whoosh' 
  | 'snap' 
  | 'wiggle' 
  | 'success' 
  | 'wrong' 
  | 'celebrate'
  | 'bubble'
  | 'bounce'
  | 'giggle';

// Letter sound configurations - each letter has personality!
const LETTER_VOICES: Record<string, { freq: number; type: OscillatorType; duration: number; slide: number; vibrato?: boolean }> = {
  'A': { freq: 440, type: 'sine', duration: 0.25, slide: 1.2, vibrato: true },
  'B': { freq: 220, type: 'square', duration: 0.18, slide: 0.8 },
  'C': { freq: 523, type: 'sine', duration: 0.2, slide: 1.1 },
  'D': { freq: 294, type: 'triangle', duration: 0.22, slide: 0.9 },
  'E': { freq: 659, type: 'sine', duration: 0.25, slide: 1.3, vibrato: true },
  'F': { freq: 349, type: 'sawtooth', duration: 0.15, slide: 0.7 },
  'G': { freq: 392, type: 'sine', duration: 0.2, slide: 1.0 },
  'H': { freq: 800, type: 'sine', duration: 0.12, slide: 0.5 },
  'I': { freq: 880, type: 'sine', duration: 0.28, slide: 1.4, vibrato: true },
  'J': { freq: 330, type: 'square', duration: 0.18, slide: 1.5 },
  'K': { freq: 600, type: 'triangle', duration: 0.1, slide: 0.6 },
  'L': { freq: 500, type: 'sine', duration: 0.22, slide: 1.1 },
  'M': { freq: 200, type: 'sine', duration: 0.3, slide: 1.0, vibrato: true },
  'N': { freq: 280, type: 'sine', duration: 0.25, slide: 0.9 },
  'O': { freq: 350, type: 'sine', duration: 0.3, slide: 1.2, vibrato: true },
  'P': { freq: 450, type: 'square', duration: 0.1, slide: 0.5 },
  'Q': { freq: 380, type: 'triangle', duration: 0.2, slide: 0.8 },
  'R': { freq: 320, type: 'sawtooth', duration: 0.2, slide: 0.9 },
  'S': { freq: 1200, type: 'sine', duration: 0.15, slide: 0.7 },
  'T': { freq: 700, type: 'square', duration: 0.08, slide: 0.4 },
  'U': { freq: 400, type: 'sine', duration: 0.28, slide: 1.3, vibrato: true },
  'V': { freq: 250, type: 'sawtooth', duration: 0.18, slide: 0.8 },
  'W': { freq: 180, type: 'sine', duration: 0.3, slide: 1.0, vibrato: true },
  'X': { freq: 550, type: 'triangle', duration: 0.12, slide: 0.6 },
  'Y': { freq: 600, type: 'sine', duration: 0.25, slide: 1.4, vibrato: true },
  'Z': { freq: 150, type: 'sawtooth', duration: 0.2, slide: 1.6 },
};

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext!;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Create oscillator-based sound effects
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    frequencyEnd?: number,
    vibrato?: boolean
  ) {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      if (frequencyEnd) {
        oscillator.frequency.exponentialRampToValueAtTime(frequencyEnd, ctx.currentTime + duration);
      }

      // Add vibrato for some letters (makes them sound more alive!)
      if (vibrato) {
        const vibratoOsc = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibratoOsc.frequency.value = 8; // vibrato speed
        vibratoGain.gain.value = frequency * 0.03; // vibrato depth
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibratoOsc.start(ctx.currentTime);
        vibratoOsc.stop(ctx.currentTime + duration);
      }

      // Envelope for more natural sound
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.02); // Attack
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.7); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration); // Release

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }

  // Play a multi-tone chord for richer sounds
  private playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration, type, volume), i * 20);
    });
  }

  // Pop sound - cute and bouncy for tapping letters
  pop() {
    this.playTone(600, 0.06, 'sine', 0.2, 900);
    setTimeout(() => this.playTone(1000, 0.04, 'sine', 0.15, 1200), 30);
  }

  // Boing sound - bouncy spring effect
  boing() {
    this.playTone(250, 0.12, 'sine', 0.18, 400);
    setTimeout(() => this.playTone(350, 0.08, 'sine', 0.12, 250), 40);
    setTimeout(() => this.playTone(300, 0.06, 'sine', 0.08), 80);
  }

  // Whoosh - for drag movements
  whoosh() {
    this.playTone(150, 0.1, 'sine', 0.12, 350);
  }

  // Snap - satisfying click when letter snaps into place
  snap() {
    this.playTone(800, 0.04, 'square', 0.12, 1200);
    setTimeout(() => this.playTone(1200, 0.06, 'sine', 0.18), 20);
  }

  // Wiggle sound - playful wobble
  wiggle() {
    this.playTone(350, 0.06, 'sine', 0.1, 450);
    setTimeout(() => this.playTone(400, 0.05, 'sine', 0.08, 350), 35);
    setTimeout(() => this.playTone(380, 0.04, 'sine', 0.06), 60);
  }

  // Success sound - triumphant ascending notes
  success() {
    this.playTone(523, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 80); // E5
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.22), 160); // G5
  }

  // Wrong answer sound - gentle "nope"
  wrong() {
    this.playTone(250, 0.12, 'triangle', 0.15, 180);
    setTimeout(() => this.playTone(200, 0.15, 'triangle', 0.12, 150), 80);
  }

  // Celebration fanfare - full scale celebration!
  celebrate() {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.12, 'sine', 0.18), i * 50);
    });
    // Add some sparkle
    setTimeout(() => this.playChord([1047, 1319, 1568], 0.3, 'sine', 0.1), 400);
  }

  // Bubble pop - light and bubbly
  bubble() {
    this.playTone(900, 0.05, 'sine', 0.12, 1300);
  }

  // Bounce - for bouncy landing
  bounce() {
    this.playTone(200, 0.08, 'sine', 0.15, 350);
    setTimeout(() => this.playTone(180, 0.06, 'sine', 0.1, 250), 50);
  }

  // Giggle - playful multi-note sound
  giggle() {
    const notes = [400, 500, 450, 550, 480];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.06, 'sine', 0.12), i * 40);
    });
  }

  // ⭐ LETTER SOUND - The main feature! Each letter has unique personality!
  // This is what plays when you click/tap on a letter
  letterSound(letter: string) {
    if (!this.enabled || typeof window === 'undefined') return;

    const upperLetter = letter.toUpperCase();
    const voice = LETTER_VOICES[upperLetter];
    
    if (voice) {
      // Play the letter's unique sound
      const endFreq = voice.freq * voice.slide;
      this.playTone(voice.freq, voice.duration, voice.type, 0.25, endFreq, voice.vibrato);
      
      // Add a little "tail" for vowels (they're more expressive!)
      if (['A', 'E', 'I', 'O', 'U'].includes(upperLetter)) {
        setTimeout(() => {
          this.playTone(voice.freq * 0.8, 0.1, 'sine', 0.1, voice.freq * 0.6);
        }, voice.duration * 500);
      }
    } else {
      // Fallback for any other character
      this.playTone(400, 0.15, 'sine', 0.2, 500);
    }
  }

  // Play a word's letters in sequence (like spelling it out)
  wordSound(word: string, delay: number = 200) {
    word.split('').forEach((letter, i) => {
      if (letter.match(/[a-zA-Z]/)) {
        setTimeout(() => this.letterSound(letter), i * delay);
      }
    });
  }

  // Play sound by type
  play(type: SoundType) {
    switch (type) {
      case 'pop': this.pop(); break;
      case 'boing': this.boing(); break;
      case 'whoosh': this.whoosh(); break;
      case 'snap': this.snap(); break;
      case 'wiggle': this.wiggle(); break;
      case 'success': this.success(); break;
      case 'wrong': this.wrong(); break;
      case 'celebrate': this.celebrate(); break;
      case 'bubble': this.bubble(); break;
      case 'bounce': this.bounce(); break;
      case 'giggle': this.giggle(); break;
    }
  }
}

// Singleton instance
export const sounds = new SoundEffects();

// Convenience hooks for React components
export function useSound() {
  return sounds;
}
