"use client";

// pronounciation branch
import { useState, useRef } from "react";
import { DraggableLetter } from "./DraggableLetter";
import { WordSlot } from "./WordSlot";
import { LEVELS } from "@/data/levels";
import { shuffleArray, getRandomPosition, cn, speak } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GameBoardProps {
  level: number;
  wordIndex: number;
  onWordComplete: () => void;
  onLevelComplete: () => void;
}

interface LetterItem {
  id: string;
  char: string;
  initialX: number;
  initialY: number;
  color: string;
  status: "idle" | "correct" | "incorrect";
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF9F1C", "#457B9D", "#9B59B6", "#F06292"];

export const GameBoard = ({ level, wordIndex, onWordComplete, onLevelComplete }: GameBoardProps) => {
  const currentLevel = LEVELS.find((l) => l.level === level)!;
  const currentWordData = currentLevel.words[wordIndex];
  const word = currentWordData.word;

  const [letters, setLetters] = useState<LetterItem[]>(() => {
    const chars = word.split("").map((char, index) => {
      const pos = getRandomPosition();
      return {
        id: `${char}-${index}-${Math.random()}`,
        char,
        initialX: pos.x,
        initialY: pos.y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        status: "idle" as const,
      };
    });
    return shuffleArray(chars);
  });

  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>(
    new Array(word.length).fill(null)
  );
  
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleDrop = (letterId: string, dropX: number, dropY: number) => {
    const letterIndex = letters.findIndex((l) => l.id === letterId);
    if (letterIndex === -1) return;

    const letter = letters[letterIndex];
    let foundSlotIndex = -1;

    // Check if drop coordinates are within any slot's bounds
    slotRefs.current.forEach((slot, index) => {
      if (slot) {
        const rect = slot.getBoundingClientRect();
        if (
          dropX >= rect.left &&
          dropX <= rect.right &&
          dropY >= rect.top &&
          dropY <= rect.bottom
        ) {
          foundSlotIndex = index;
        }
      }
    });

    if (foundSlotIndex !== -1 && word[foundSlotIndex] === letter.char && !placedLetters[foundSlotIndex]) {
      // Correct placement
      const newPlaced = [...placedLetters];
      newPlaced[foundSlotIndex] = letter.id;
      setPlacedLetters(newPlaced);

      const newLetters = [...letters];
      newLetters[letterIndex].status = "correct";
      setLetters(newLetters);

      // Check if word is complete
      if (newPlaced.every((p) => p !== null)) {
        handleWordComplete();
      }
    } else {
      // Incorrect placement
      const newLetters = [...letters];
      newLetters[letterIndex].status = "incorrect";
      setLetters(newLetters);
      
      // Reset status after animation
      setTimeout(() => {
        setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status: "idle" } : l));
      }, 500);
    }
  };

  const handleWordComplete = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: COLORS,
    });

    speak(word);
    setShowCompletionOverlay(true);

    setTimeout(() => {
      setShowCompletionOverlay(false);
      if (wordIndex === currentLevel.words.length - 1) {
        onLevelComplete();
      } else {
        onWordComplete();
      }
    }, 2500); // 2.5 seconds to show the image and progress
  };

  return (
    <div className="relative w-full h-[80vh] flex flex-col items-center justify-between p-8 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-200 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-blue-200 blur-3xl animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-yellow-200 blur-2xl" />
        <div className="absolute top-20 right-1/3 w-40 h-40 rounded-full bg-green-200 blur-3xl" />
      </div>

      <div className="absolute top-8 text-center w-full pointer-events-none">
        <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">
          Arrange the letters!
        </h2>
      </div>

      {/* Target Word Display */}
      <div className="flex flex-wrap gap-3 lg:gap-4 items-center justify-center mt-24 lg:mt-32 px-4">
        {word.split("").map((char, index) => (
          <div
            key={`slot-${index}`}
            ref={(el) => { slotRefs.current[index] = el; }}
          >
            <WordSlot
              letter={char}
              isFilled={placedLetters[index] !== null}
            />
          </div>
        ))}
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {showCompletionOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm pointer-events-auto"
          >
            {currentWordData.image && (
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-64 h-64 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white mb-8"
              >
                <Image
                  src={currentWordData.image}
                  alt={word}
                  fill
                  className="object-cover"
                />
              </motion.div>
            )}
            <motion.h2
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-6xl font-black text-blue-600 mb-2"
            >
              {word}!
            </motion.h2>
            <p className="text-2xl font-bold text-gray-400 uppercase tracking-widest">
              Word {wordIndex + 1}/{currentLevel.words.length} Completed
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scattered Letters */}
      <div className="absolute inset-0 pointer-events-none">
        {letters.map((letter) => (
          <div key={letter.id}>
            {letter.status !== "correct" && (
              <DraggableLetter
                id={letter.id}
                letter={letter.char}
                initialX={letter.initialX}
                initialY={letter.initialY}
                color={letter.color}
                status={letter.status}
                onDrop={handleDrop}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-4">
        <span className="text-xl font-bold text-gray-700">Level {level}</span>
        <div className="flex gap-1">
          {currentLevel.words.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                i < wordIndex ? "bg-green-500 scale-110" : i === wordIndex ? "bg-blue-500 animate-pulse" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-500">Word {wordIndex + 1}/5</span>
      </div>
    </div>
  );
};
