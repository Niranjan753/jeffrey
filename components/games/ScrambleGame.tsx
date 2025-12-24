"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lightbulb, RotateCcw, Check, X } from "lucide-react";
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
  onRestart: () => void;
}

export function ScrambleGame({ words, timeLimit, onComplete, onWordComplete, onRestart }: ScrambleGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [shake, setShake] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const currentWord = words[currentIndex];

  const scrambleWord = useCallback((word: string) => {
    const letters = word.split("");
    let shuffled = shuffleArray(letters);
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

  useEffect(() => {
    if (gameEnded) return;
    
    if (timeLeft <= 0) {
      setShowTimeUp(true);
      setGameEnded(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameEnded]);

  const handleRestart = () => {
    onRestart();
  };

  const handleLetterClick = (index: number) => {
    if (gameEnded) return;
    
    if (selectedIndices.includes(index)) {
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      if (newSelected.length === currentWord.word.length) {
        const guessedWord = newSelected.map((i) => scrambledLetters[i]).join("");
        
        if (guessedWord === currentWord.word) {
          setShowSuccess(true);
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });

          setTimeout(() => {
            setShowSuccess(false);
            if (currentIndex < words.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              onWordComplete();
            } else {
              setGameEnded(true);
              onComplete(hintsUsed === 0);
            }
          }, 800);
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setSelectedIndices([]);
          }, 400);
        }
      }
    }
  };

  const handleReshuffle = () => {
    if (gameEnded) return;
    setScrambledLetters(scrambleWord(currentWord.word));
    setSelectedIndices([]);
  };

  const handleShowHint = () => {
    if (gameEnded) return;
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
  };

  const timePercentage = (timeLeft / timeLimit) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-white overflow-hidden">
      {/* Timer Bar */}
      <div className="w-full h-1 bg-gray-100">
        <motion.div
          className={cn("h-full transition-all", isLowTime ? "bg-black" : "bg-[#0a33ff]")}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {/* Header */}
      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-semibold",
          isLowTime ? "bg-black text-white" : "bg-gray-100 text-black"
        )}>
          <Clock className="w-4 h-4" />
          {timeLeft}s
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReshuffle}
            disabled={gameEnded}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleShowHint}
            disabled={showHint || gameEnded}
            className={cn(
              "p-3 rounded-full transition-colors",
              showHint || gameEnded ? "bg-gray-100 text-gray-300" : "bg-[#0a33ff] text-white hover:bg-[#0829cc]"
            )}
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 px-4 mb-4">
        {words.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              i < currentIndex ? "bg-black" : i === currentIndex ? "bg-[#0a33ff]" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-1">Unscramble</h2>
          <p className="text-gray-500 text-sm">Tap letters in order</p>
        </div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gray-100 rounded-xl px-6 py-3 mb-6"
            >
              <p className="text-gray-700 font-medium text-center">{currentWord.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Letters Display */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="flex gap-2 mb-8 min-h-[56px] flex-wrap justify-center"
        >
          {currentWord.word.split("").map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all",
                selectedIndices[i] !== undefined
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-200 border-dashed"
              )}
            >
              {selectedIndices[i] !== undefined ? scrambledLetters[selectedIndices[i]] : ""}
            </div>
          ))}
        </motion.div>

        {/* Scrambled Letters */}
        <div className="flex gap-2 flex-wrap justify-center">
          {scrambledLetters.map((letter, i) => {
            const isSelected = selectedIndices.includes(i);
            return (
              <motion.button
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLetterClick(i)}
                disabled={showSuccess || gameEnded}
                className={cn(
                  "w-14 h-14 rounded-xl text-xl font-bold transition-all cursor-pointer disabled:cursor-not-allowed",
                  isSelected
                    ? "bg-gray-100 text-gray-300"
                    : "bg-[#0a33ff] text-white hover:bg-[#0829cc]"
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black">{currentWord.word}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time's Up Overlay */}
      <AnimatePresence>
        {showTimeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center px-6"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Time's Up!</h2>
              <p className="text-gray-500 mb-8">
                You completed {currentIndex} of {words.length} words
              </p>
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-[#0a33ff] text-white rounded-xl font-semibold hover:bg-[#0829cc] transition-colors flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                Restart Level
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info */}
      <div className="w-full px-4 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between max-w-lg mx-auto text-sm text-gray-500">
          <span>Word {currentIndex + 1} of {words.length}</span>
          {hintsUsed > 0 && <span>{hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used</span>}
        </div>
      </div>
    </div>
  );
}
