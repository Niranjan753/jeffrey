import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

