"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lightbulb, RotateCcw, Sparkles, Zap } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import confetti from "canvas-confetti";

interface ScrambleWord {
  word: string;
  hint: string;
}

interface ScrambleGameProps {
  words: ScrambleWord[];
  timeLimit: number;
  onComplete: (perfect: boolean) => void;
  onWordComplete: () => void;
}

export function ScrambleGame({ words, timeLimit, onComplete, onWordComplete }: ScrambleGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const currentWord = words[currentIndex];

  const scrambleWord = useCallback((word: string) => {
    const letters = word.split("");
    let shuffled = shuffleArray(letters);
    // Make sure it's actually scrambled
    while (shuffled.join("") === word && word.length > 2) {
      shuffled = shuffleArray(letters);
    }
    return shuffled;
  }, []);

  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord.word));
      setSelectedIndices([]);
      setShowHint(false);
    }
  }, [currentWord, scrambleWord]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const handleLetterClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      // Deselect
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      // Select
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      // Check if word is complete
      if (newSelected.length === currentWord.word.length) {
        const guessedWord = newSelected.map((i) => scrambledLetters[i]).join("");
        
        if (guessedWord === currentWord.word) {
          // Correct!
          setShowSuccess(true);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });

          setTimeout(() => {
            setShowSuccess(false);
            if (currentIndex < words.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              onWordComplete();
            } else {
              onComplete(hintsUsed === 0);
            }
          }, 1000);
        } else {
          // Wrong - shake and reset
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setSelectedIndices([]);
          }, 500);
        }
      }
    }
  };

  const handleReshuffle = () => {
    setScrambledLetters(scrambleWord(currentWord.word));
    setSelectedIndices([]);
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
  };

  const selectedWord = selectedIndices.map((i) => scrambledLetters[i]).join("");
  const timePercentage = (timeLeft / timeLimit) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-gradient-to-b from-teal-50 via-cyan-50 to-blue-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-teal-200/30 blur-3xl" />
        <div className="absolute top-40 right-10 w-56 h-56 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-blue-200/30 blur-2xl" />
      </div>

      {/* Timer Bar */}
      <div className="w-full h-2 bg-gray-200 relative z-10">
        <motion.div
          className={cn(
            "h-full transition-all duration-1000",
            isLowTime ? "bg-red-500" : "bg-gradient-to-r from-teal-400 to-cyan-500"
          )}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg",
            isLowTime ? "bg-red-100 text-red-600 animate-pulse" : "bg-white/80 text-gray-700"
          )}>
            <Clock className="w-5 h-5" />
            {timeLeft}s
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReshuffle}
            className="p-3 rounded-2xl bg-white/80 text-gray-600 hover:bg-white transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleShowHint}
            disabled={showHint}
            className={cn(
              "p-3 rounded-2xl transition-all active:scale-95",
              showHint ? "bg-gray-200 text-gray-400" : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            )}
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 flex gap-2 px-4 mb-4">
        {words.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-teal-500 animate-pulse" : "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 w-full max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-teal-500" />
            <h2 className="text-2xl md:text-3xl font-black text-teal-600">UNSCRAMBLE!</h2>
            <Zap className="w-6 h-6 text-teal-500" />
          </div>
          <p className="text-gray-500 font-medium">Tap letters in the right order</p>
        </motion.div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-6 py-3 mb-6"
            >
              <p className="text-yellow-800 font-bold text-center">💡 {currentWord.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Letters Display */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2 md:gap-3 mb-8 min-h-[60px] md:min-h-[80px] flex-wrap justify-center"
        >
          {currentWord.word.split("").map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-12 md:w-16 md:h-16 rounded-2xl border-3 flex items-center justify-center text-2xl md:text-3xl font-black transition-all",
                selectedIndices[i] !== undefined
                  ? "bg-teal-500 text-white border-teal-600 shadow-lg"
                  : "bg-white/50 border-dashed border-gray-300"
              )}
            >
              {selectedIndices[i] !== undefined ? scrambledLetters[selectedIndices[i]] : ""}
            </div>
          ))}
        </motion.div>

        {/* Scrambled Letters */}
        <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
          {scrambledLetters.map((letter, i) => {
            const isSelected = selectedIndices.includes(i);
            return (
              <motion.button
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                whileHover={{ scale: isSelected ? 1 : 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLetterClick(i)}
                disabled={showSuccess}
                className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-2xl text-2xl md:text-3xl font-black transition-all shadow-lg",
                  isSelected
                    ? "bg-gray-200 text-gray-400 scale-90 shadow-none"
                    : "bg-gradient-to-br from-teal-400 to-cyan-500 text-white hover:shadow-xl"
                )}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
            >
              <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-teal-600">{currentWord.word}!</h2>
              <p className="text-gray-500 font-bold mt-2">Perfect! 🎉</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Progress */}
      <div className="relative z-10 w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="font-bold text-gray-500">
            Word {currentIndex + 1} of {words.length}
          </span>
          <div className="flex items-center gap-2">
            {hintsUsed > 0 && (
              <span className="text-sm text-yellow-600 font-bold">
                {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

