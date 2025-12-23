import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function speak(text: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for kids to hear clearly
    utterance.pitch = 1.1; // A bit higher pitch for a friendly "kid-game" feel
    
    // Voices are loaded asynchronously, so we try to get them
    const voices = window.speechSynthesis.getVoices();
    // Prefer a friendly sounding voice if available
    const friendlyVoice = voices.find(v => 
      v.name.includes("Google") || 
      v.name.includes("Female") || 
      v.name.includes("Samantha")
    );
    
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    window.speechSynthesis.speak(utterance);
  }
}

export function playLevelWinSound() {
  if (typeof window !== "undefined") {
    const audio = new Audio("/level.mp3");
    audio.playbackRate = 2.0;
    audio.play().catch(() => {
      // Silent catch for autoplay blocks
    });
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function getRandomPosition() {
  // Random position within safe bounds for letters to be scattered
  // Keep letters in the lower portion but with safe margins
  return {
    x: Math.random() * 70 + 15, // 15% to 85%
    y: Math.random() * 25 + 55, // 55% to 80% (lower-middle, ensuring visibility)
  };
}

