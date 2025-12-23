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
  return {
    x: Math.random() * 80 + 10, // 10% to 90%
    y: Math.random() * 30 + 60, // 60% to 90% (bottom part of screen)
  };
}

