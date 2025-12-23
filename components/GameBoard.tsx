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
    <div className="relative w-full h-full min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Decorative background elements with better positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute top-20 right-10 w-48 h-48 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-yellow-200/30 blur-2xl" />
        <div className="absolute top-1/4 right-1/3 w-40 h-40 rounded-full bg-green-200/30 blur-3xl" />
        
        {/* Floating decorative elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-20 text-6xl opacity-10"
        >
          ⭐
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-32 text-5xl opacity-10"
        >
          🎨
        </motion.div>
      </div>

      {/* Top Section with Title */}
      <div className="relative z-10 w-full pt-8 pb-4 text-center pointer-events-none">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 uppercase tracking-wider mb-2"
        >
          Arrange the letters!
        </motion.h2>
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-bold">
          <span>Drag and drop to spell</span>
        </div>
      </div>

      {/* Target Word Display - Centered */}
      <div className="relative z-10 flex-shrink-0 flex flex-wrap gap-3 lg:gap-4 items-center justify-center px-4 py-8 mt-8">
        {word.split("").map((char, index) => (
          <motion.div
            key={`slot-${index}`}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: "spring" }}
          >
            <WordSlot
              letter={char}
              isFilled={placedLetters[index] !== null}
            />
          </motion.div>
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

      {/* Playing Area - This is where letters will be scattered */}
      <div className="relative z-0 flex-grow w-full min-h-[400px] pointer-events-none">
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

      {/* Progress Indicator - Bottom fixed with proper spacing */}
      <div className="relative z-10 w-full flex justify-center pb-8 pt-4 flex-shrink-0">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md px-6 lg:px-8 py-3 lg:py-4 rounded-3xl shadow-xl border-2 border-gray-100 flex items-center gap-4 lg:gap-6"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">{level}</span>
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider hidden lg:block">Level</span>
          </div>
          
          <div className="h-8 w-px bg-gray-200" />
          
          <div className="flex gap-2">
            {currentLevel.words.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300",
                  i < wordIndex 
                    ? "bg-green-500 scale-110 shadow-lg shadow-green-200" 
                    : i === wordIndex 
                      ? "bg-blue-500 animate-pulse scale-125 shadow-lg shadow-blue-200" 
                      : "bg-gray-200"
                )}
              >
                {i < wordIndex && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px]">✓</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="h-8 w-px bg-gray-200" />
          
          <span className="text-sm lg:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {wordIndex + 1}/{currentLevel.words.length}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
