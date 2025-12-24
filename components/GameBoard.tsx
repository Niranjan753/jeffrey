"use client";

import { useState, useRef } from "react";
import { DraggableLetter } from "./DraggableLetter";
import { WordSlot } from "./WordSlot";
import { LEVELS, WordData } from "@/data/levels";
import { shuffleArray, getRandomPosition, cn, speak } from "@/lib/utils";
import { getRandomNearMiss, EngagementState } from "@/lib/engagement";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

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

const COLORS = ["#0a33ff", "#000000", "#374151", "#1f2937", "#111827"];

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

      confetti({
        particleCount: 20,
        spread: 30,
        origin: { x: dropX / window.innerWidth, y: dropY / window.innerHeight },
        colors: ["#0a33ff", "#000000"],
        scalar: 0.7,
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
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });
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
    }, 2000);
  };

  const remainingLetters = letters.filter(l => l.status !== "correct").length;
  const progress = ((word.length - remainingLetters) / word.length) * 100;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-white overflow-hidden touch-none">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-[#0a33ff]"
        />
      </div>

      {/* Near-Miss Message */}
      <AnimatePresence>
        {showNearMiss && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-black text-white px-5 py-3 rounded-xl"
          >
            <span className="font-medium">{nearMissMessage}</span>
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
              "fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-xl font-semibold",
              showFeedback.type === "correct" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
            )}
          >
            {showFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 w-full pt-6 pb-2 text-center pointer-events-none px-4 flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-black">Spell the word</h2>
        <p className="text-gray-500 text-sm">Drag letters to the slots</p>
      </div>

      {/* Word Slots */}
      <div className="relative z-10 flex-shrink-0 flex flex-wrap gap-2 md:gap-3 items-center justify-center px-4 py-4 max-w-[95%]">
        {word.split("").map((char, index) => (
          <motion.div
            key={`slot-${index}`}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
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
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white"
          >
            {currentWordData?.image && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg border border-gray-200 mb-4"
              >
                <Image src={currentWordData.image} alt={word} fill className="object-cover" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black">{word}</h2>
            </motion.div>
            <p className="text-gray-500 text-sm mt-2">
              {wordIndex + 1}/{totalWords}
            </p>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pb-4 pt-3 px-4 bg-white border-t border-gray-100 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-lg bg-gray-100">
            <span className="font-semibold text-black text-sm">Level {level}</span>
          </div>
          
          <div className="flex gap-1.5">
            {words.map((_, i) => {
              const isCompleted = i < wordIndex;
              const isCurrent = i === wordIndex;
              return (
                <button
                  key={i}
                  onClick={() => i <= wordIndex && onWordIndexChange?.(i)}
                  disabled={i > wordIndex}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    isCompleted ? "bg-black" : isCurrent ? "bg-[#0a33ff]" : "bg-gray-200"
                  )}
                />
              );
            })}
          </div>
          
          <span className="text-sm font-medium text-gray-500">{wordIndex + 1}/{totalWords}</span>
        </div>
      </div>
    </div>
  );
};
