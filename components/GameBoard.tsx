"use client";

import { useState, useRef } from "react";
import { DraggableLetter } from "./DraggableLetter";
import { WordSlot } from "./WordSlot";
import { LEVELS, WordData } from "@/data/levels";
import { shuffleArray, getRandomPosition, cn, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import { getRandomNearMiss, EngagementState } from "@/lib/engagement";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check, Sparkles } from "lucide-react";

interface GameBoardProps {
  level: number;
  wordIndex: number;
  onWordComplete: () => void;
  onLevelComplete: () => void;
  onWordIndexChange?: (newIndex: number) => void;
  onMistake?: () => void;
  engagement?: EngagementState | null;
  customWords?: WordData[];
}

interface LetterItem {
  id: string;
  char: string;
  initialX: number;
  initialY: number;
  color: string;
  status: "idle" | "correct" | "incorrect";
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#FF9F43", "#6C5CE7", "#00B894", "#FD79A8"];

export const GameBoard = ({ 
  level, 
  wordIndex, 
  onWordComplete, 
  onLevelComplete, 
  onWordIndexChange,
  onMistake,
  customWords
}: GameBoardProps) => {
  const words = customWords || LEVELS.find((l) => l.level === level)?.words || [];
  const currentWordData = words[wordIndex];
  const totalWords = words.length;
  const word = currentWordData?.word || "";

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

    slotRefs.current.forEach((slot, index) => {
      if (slot) {
        const rect = slot.getBoundingClientRect();
        if (dropX >= rect.left && dropX <= rect.right && dropY >= rect.top && dropY <= rect.bottom) {
          foundSlotIndex = index;
        }
      }
    });

    if (foundSlotIndex !== -1 && word[foundSlotIndex] === letter.char && !placedLetters[foundSlotIndex]) {
      const newPlaced = [...placedLetters];
      newPlaced[foundSlotIndex] = letter.id;
      setPlacedLetters(newPlaced);

      const newLetters = [...letters];
      newLetters[letterIndex].status = "correct";
      setLetters(newLetters);

      setShowFeedback({ type: "correct", message: "✓" });
      setTimeout(() => setShowFeedback(null), 600);
      
      // Success sound when letter placed correctly
      sounds.snap();

      confetti({
        particleCount: 35,
        spread: 45,
        origin: { x: dropX / window.innerWidth, y: dropY / window.innerHeight },
        colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6C5CE7", "#00B894"],
        scalar: 0.9,
      });

      if (newPlaced.every((p) => p !== null)) {
        handleWordComplete();
      }
    } else {
      const newLetters = [...letters];
      newLetters[letterIndex].status = "incorrect";
      setLetters(newLetters);
      
      const newMistakeCount = mistakeCount + 1;
      setMistakeCount(newMistakeCount);
      onMistake?.();
      
      // Wrong sound for incorrect placement
      sounds.wrong();

      setShowFeedback({ type: "incorrect", message: "Try again" });
      setTimeout(() => setShowFeedback(null), 600);

      if (newMistakeCount >= 3 && newMistakeCount % 2 === 1) {
        const nearMiss = getRandomNearMiss();
        setNearMissMessage(nearMiss);
        setShowNearMiss(true);
        setTimeout(() => setShowNearMiss(false), 2000);
      }
      
      setTimeout(() => {
        setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status: "idle" } : l));
      }, 400);
    }
  };

  const handleWordComplete = () => {
    // Celebration sounds and confetti!
    sounds.celebrate();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6C5CE7", "#00B894", "#FD79A8"] });
    speak(word);
    setShowCompletionOverlay(true);
    setMistakeCount(0);

    setTimeout(() => {
      setShowCompletionOverlay(false);
      if (wordIndex === totalWords - 1) {
        onLevelComplete();
      } else {
        onWordComplete();
      }
    }, 2500);
  };

  const remainingLetters = letters.filter(l => l.status !== "correct").length;
  const progress = ((word.length - remainingLetters) / word.length) * 100;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-gradient-to-b from-sky-100 via-white to-amber-50 overflow-hidden touch-none">
      {/* Decorative Stars Background - like Endless Reader! */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              fontSize: `${14 + Math.random() * 16}px`,
            }}
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{
              rotate: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2 + Math.random(), repeat: Infinity, repeatType: "reverse" },
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100 z-50">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#4ECDC4] via-[#6C5CE7] to-[#FF6B6B]"
        />
      </div>

      {/* Near-Miss Message */}
      <AnimatePresence>
        {showNearMiss && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-xl"
          >
            <span className="font-bold">{nearMissMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] px-6 py-4 rounded-2xl font-bold text-lg shadow-xl",
              showFeedback.type === "correct" 
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" 
                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600"
            )}
          >
            {showFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 w-full pt-8 pb-3 text-center pointer-events-none px-4 flex-shrink-0">
        <motion.h2 
          className="text-2xl md:text-3xl font-black text-gray-800 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Sparkles className="w-7 h-7 text-amber-500" />
          Spell the word!
          <Sparkles className="w-7 h-7 text-amber-500" />
        </motion.h2>
        <p className="text-gray-600 text-base font-medium mt-1">Drag letters to the slots</p>
      </div>

      {/* Word Slots */}
      <div className="relative z-10 flex-shrink-0 flex flex-wrap gap-3 md:gap-4 items-center justify-center px-4 py-4 max-w-[95%]">
        {word.split("").map((char, index) => (
          <motion.div
            key={`slot-${index}`}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
          >
            <WordSlot letter={char} isFilled={placedLetters[index] !== null} />
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
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
          >
            {currentWordData?.image && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-white mb-6"
              >
                <Image src={currentWordData.image} alt={word} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-800">
                {word}
              </h2>
            </motion.div>
            <motion.p 
              className="text-gray-500 text-lg mt-3 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Word {wordIndex + 1} of {totalWords} ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Area */}
      <div className="relative z-0 flex-1 min-h-0 w-full pointer-events-none px-4 pb-20 flex items-center justify-center">
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

      {/* Bottom Progress */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pb-4 pt-3 px-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#a855f7] shadow-lg">
            <span className="font-bold text-white text-sm">Level {level}</span>
          </div>
          
          <div className="flex gap-2">
            {words.map((_, i) => {
              const isCompleted = i < wordIndex;
              const isCurrent = i === wordIndex;
              return (
                <motion.button
                  key={i}
                  onClick={() => i <= wordIndex && onWordIndexChange?.(i)}
                  disabled={i > wordIndex}
                  whileHover={i <= wordIndex ? { scale: 1.2 } : {}}
                  whileTap={i <= wordIndex ? { scale: 0.9 } : {}}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all shadow-md",
                    isCompleted ? "bg-gradient-to-br from-green-400 to-emerald-500" : 
                    isCurrent ? "bg-gradient-to-br from-[#6C5CE7] to-[#a855f7]" : 
                    "bg-white/60 border border-gray-200"
                  )}
                />
              );
            })}
          </div>
          
          <span className="text-base font-bold text-gray-600">{wordIndex + 1}/{totalWords}</span>
        </div>
      </div>
    </div>
  );
};
