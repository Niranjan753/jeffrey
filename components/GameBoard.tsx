"use client";

// pronounciation branch
import { useState, useRef } from "react";
import { DraggableLetter } from "./DraggableLetter";
import { WordSlot } from "./WordSlot";
import { LEVELS } from "@/data/levels";
import { shuffleArray, getRandomPosition, cn, speak } from "@/lib/utils";
import { getRandomNearMiss, EngagementState } from "@/lib/engagement";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, Zap, AlertCircle } from "lucide-react";

interface GameBoardProps {
  level: number;
  wordIndex: number;
  onWordComplete: () => void;
  onLevelComplete: () => void;
  onWordIndexChange?: (newIndex: number) => void;
  onMistake?: () => void;
  engagement?: EngagementState | null;
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

// Encouraging messages for correct placements (variable rewards)
const CORRECT_MESSAGES = ["Nice! ✨", "Great! 🌟", "Perfect! 💫", "Awesome! ⚡", "Yes! 🎯"];

export const GameBoard = ({ 
  level, 
  wordIndex, 
  onWordComplete, 
  onLevelComplete, 
  onWordIndexChange,
  onMistake,
  engagement 
}: GameBoardProps) => {
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
  const [showFeedback, setShowFeedback] = useState<{ type: "correct" | "incorrect"; message: string } | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [nearMissMessage, setNearMissMessage] = useState("");
  
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

      // Show positive feedback (variable reward - random message)
      const message = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
      setShowFeedback({ type: "correct", message });
      setTimeout(() => setShowFeedback(null), 800);

      // Small confetti burst for each correct letter
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { x: dropX / window.innerWidth, y: dropY / window.innerHeight },
        colors: [letter.color],
        scalar: 0.8,
      });

      // Check if word is complete
      if (newPlaced.every((p) => p !== null)) {
        handleWordComplete();
      }
    } else {
      // Incorrect placement - Loss Aversion trigger
      const newLetters = [...letters];
      newLetters[letterIndex].status = "incorrect";
      setLetters(newLetters);
      
      // Increment mistake count
      const newMistakeCount = mistakeCount + 1;
      setMistakeCount(newMistakeCount);
      
      // Notify parent about mistake (affects "perfect" status)
      onMistake?.();

      // Show negative feedback
      setShowFeedback({ type: "incorrect", message: "Try again! 🎯" });
      setTimeout(() => setShowFeedback(null), 800);

      // Near-miss psychology: After 3 mistakes, show encouraging message
      if (newMistakeCount >= 3 && newMistakeCount % 2 === 1) {
        const nearMiss = getRandomNearMiss();
        setNearMissMessage(nearMiss);
        setShowNearMiss(true);
        setTimeout(() => setShowNearMiss(false), 2500);
      }
      
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
    setMistakeCount(0); // Reset for next word

    setTimeout(() => {
      setShowCompletionOverlay(false);
      if (wordIndex === currentLevel.words.length - 1) {
        onLevelComplete();
      } else {
        onWordComplete();
      }
    }, 2500); // 2.5 seconds to show the image and progress
  };

  // Calculate remaining letters
  const remainingLetters = letters.filter(l => l.status !== "correct").length;
  const progress = ((word.length - remainingLetters) / word.length) * 100;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 overflow-hidden touch-none">
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
          className="hidden md:block absolute top-32 right-20 text-6xl opacity-10"
        >
          ⭐
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block absolute top-40 left-32 text-5xl opacity-10"
        >
          🎨
        </motion.div>
      </div>

      {/* Near-Miss Encouragement Overlay */}
      <AnimatePresence>
        {showNearMiss && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <Zap className="w-6 h-6 animate-pulse" />
            <span className="font-bold text-lg">{nearMissMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 rounded-2xl shadow-xl font-black text-xl ${
              showFeedback.type === "correct" 
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" 
                : "bg-gradient-to-r from-red-400 to-pink-500 text-white"
            }`}
          >
            {showFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section with Title */}
      <div className="relative z-10 w-full pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2 md:pb-3 text-center pointer-events-none px-2 flex-shrink-0">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm sm:text-base md:text-xl lg:text-3xl font-black text-purple-600 uppercase tracking-wide"
        >
          Arrange the letters!
        </motion.h2>
        <div className="hidden lg:flex items-center justify-center gap-2 text-gray-400 text-xs md:text-sm font-bold">
          <span>Drag and drop to spell</span>
        </div>
      </div>

      {/* Progress indicator at top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 origin-left z-50"
        style={{ width: "100%" }}
      />

      {/* Target Word Display - Centered */}
      <div className="relative z-10 flex-shrink-0 flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 items-center justify-center px-2 sm:px-4 py-2 sm:py-3 md:py-4 max-w-[95%] sm:max-w-full">
        {word.split("").map((char, index) => (
          <motion.div
            key={`slot-${index}`}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              delay: index * 0.08, 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm pointer-events-auto"
          >
            {currentWordData.image && (
              <motion.div
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
                className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-3 md:border-5 border-white mb-2 sm:mb-4 md:mb-6"
              >
                <Image
                  src={currentWordData.image}
                  alt={word}
                  fill
                  className="object-cover"
                />
                {/* Sparkle overlay */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
              className="flex items-center gap-2 mb-1"
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-blue-600">
                {word}!
              </h2>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-400 uppercase tracking-widest px-4 text-center"
            >
              Word {wordIndex + 1}/{currentLevel.words.length} Completed
            </motion.p>
            
            {/* Bonus indicator if no mistakes */}
            {mistakeCount === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold"
              >
                ⭐ Perfect! Bonus coins!
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playing Area - This is where letters will be scattered */}
      <div className="relative z-0 flex-1 min-h-0 w-full pointer-events-none px-2 md:px-4 pb-16 sm:pb-20 md:pb-24 flex items-center justify-center">
        <div className="relative w-full h-full max-w-2xl">
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
      </div>

      {/* Progress Indicator - Bottom fixed with proper spacing */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pb-3 sm:pb-4 md:pb-5 pt-2 sm:pt-2.5 md:pt-3 px-2 sm:px-4 bg-gradient-to-t from-pink-50 via-pink-50/80 to-transparent pointer-events-none">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white/95 backdrop-blur-md px-2.5 sm:px-4 md:px-5 lg:px-7 py-1.5 sm:py-2 md:py-2.5 lg:py-3.5 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg md:shadow-xl border-2 border-gray-100 sm:border-2 flex items-center gap-1.5 sm:gap-2.5 md:gap-4 lg:gap-6 will-change-transform max-w-full overflow-hidden pointer-events-auto"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-md sm:rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-[10px] sm:text-xs md:text-sm">{level}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:block">Level</span>
          </div>
          
          <div className="h-4 sm:h-5 md:h-7 w-px bg-gray-200 flex-shrink-0" />
          
          <div className="flex gap-1 sm:gap-1.5 md:gap-2 flex-wrap justify-center">
            {currentLevel.words.map((_, i) => {
              const isClickable = i <= wordIndex;
              const isCompleted = i < wordIndex;
              const isCurrent = i === wordIndex;
              
              return (
                <button
                  key={i}
                  onClick={() => isClickable && onWordIndexChange?.(i)}
                  disabled={!isClickable}
                  className={cn(
                    "relative w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full transition-all duration-300 ease-out flex-shrink-0",
                    isCompleted 
                      ? "bg-green-500 scale-100 shadow-sm shadow-green-200 hover:scale-110 cursor-pointer" 
                      : isCurrent 
                        ? "bg-blue-500 animate-pulse scale-100 shadow-sm shadow-blue-200 cursor-pointer hover:scale-115" 
                        : "bg-gray-200 cursor-not-allowed opacity-50",
                    isClickable && "active:scale-95 active:transition-transform active:duration-100"
                  )}
                >
                  {isCompleted && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-white font-bold">✓</span>
                  )}
                  {isCurrent && (
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-white font-black">{i + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="h-6 sm:h-8 w-px bg-gray-200 hidden sm:block flex-shrink-0" />
          
          <span className="text-xs sm:text-sm lg:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hidden sm:inline flex-shrink-0">
            {wordIndex + 1}/{currentLevel.words.length}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
