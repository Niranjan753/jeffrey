"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lightbulb, RotateCcw, Check, Sparkles } from "lucide-react";
import { cn, shuffleArray, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
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

// Fun, vibrant colors for monster letters - like Endless Reader!
const MONSTER_COLORS = [
  { bg: "#FF6B6B", pattern: "spots" },
  { bg: "#4ECDC4", pattern: "stripes" },
  { bg: "#FFE66D", pattern: "dots" },
  { bg: "#95E1D3", pattern: "zigzag" },
  { bg: "#F38181", pattern: "crosshatch" },
  { bg: "#AA96DA", pattern: "spots" },
  { bg: "#FCBAD3", pattern: "stripes" },
  { bg: "#A8D8EA", pattern: "dots" },
  { bg: "#FF9F43", pattern: "spots" },
  { bg: "#6C5CE7", pattern: "crosshatch" },
  { bg: "#00B894", pattern: "zigzag" },
  { bg: "#FD79A8", pattern: "dots" },
];

// Googly Eye Component - follows the cursor!
function GooglyEye({ 
  size = "md",
  lookAt,
}: { 
  size?: "sm" | "md" | "lg";
  lookAt: { x: number; y: number };
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  const pupilSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };
  
  return (
    <motion.div
      className={cn(
        "rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-2 border-gray-100",
        sizeClasses[size]
      )}
      animate={{ rotate: [-2, 2] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <motion.div
        className={cn("rounded-full bg-gray-900", pupilSizes[size])}
        animate={{
          x: lookAt.x * 2,
          y: lookAt.y * 2,
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// Pattern SVG overlays for texture
function PatternOverlay({ pattern }: { pattern: string }) {
  const patterns: Record<string, React.ReactNode> = {
    spots: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="20" cy="30" r="10" fill="currentColor" />
        <circle cx="70" cy="20" r="8" fill="currentColor" />
        <circle cx="50" cy="65" r="12" fill="currentColor" />
        <circle cx="85" cy="75" r="9" fill="currentColor" />
        <circle cx="25" cy="80" r="7" fill="currentColor" />
      </svg>
    ),
    stripes: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="10" />
        <line x1="0" y1="55" x2="100" y2="55" stroke="currentColor" strokeWidth="10" />
        <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="10" />
      </svg>
    ),
    crosshatch: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
        <line x1="30" y1="0" x2="100" y2="70" stroke="currentColor" strokeWidth="4" />
        <line x1="0" y1="30" x2="70" y2="100" stroke="currentColor" strokeWidth="4" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="4" />
        <line x1="70" y1="0" x2="0" y2="70" stroke="currentColor" strokeWidth="4" />
        <line x1="100" y1="30" x2="30" y2="100" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={20 + (i % 3) * 30} cy={20 + Math.floor(i / 3) * 30} r="5" fill="currentColor" />
        ))}
      </svg>
    ),
    zigzag: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="0,30 25,10 50,30 75,10 100,30" fill="none" stroke="currentColor" strokeWidth="5" />
        <polyline points="0,60 25,40 50,60 75,40 100,60" fill="none" stroke="currentColor" strokeWidth="5" />
        <polyline points="0,90 25,70 50,90 75,70 100,90" fill="none" stroke="currentColor" strokeWidth="5" />
      </svg>
    ),
  };
  
  return patterns[pattern] || null;
}

// Monster Letter Component with googly eyes and personality!
function MonsterLetter({
  letter,
  index,
  isSelected,
  isDisabled,
  onClick,
  colorData,
}: {
  letter: string;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  colorData: { bg: string; pattern: string };
}) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const [hasArms] = useState(() => Math.random() > 0.5);

  // Track mouse for googly eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let clientX: number, clientY: number;
      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }
      
      const deltaX = (clientX - centerX) / 100;
      const deltaY = (clientY - centerY) / 100;
      setLookAt({
        x: Math.max(-1, Math.min(1, deltaX)),
        y: Math.max(-1, Math.min(1, deltaY)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, []);

  const handleClick = () => {
    if (isDisabled) return;
    // Play the letter's unique sound - each letter has personality like Endless Reader!
    sounds.letterSound(letter);
    sounds.pop();
    speak(letter.toLowerCase());
    onClick();
  };

  return (
    <motion.button
      ref={containerRef}
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        ease: "easeOut"
      }}
      whileHover={!isSelected && !isDisabled ? { scale: 1.1 } : {}}
      whileTap={!isDisabled ? { scale: 0.9 } : {}}
      onClick={handleClick}
      disabled={isDisabled}
      style={{ backgroundColor: isSelected ? "#E5E7EB" : colorData.bg }}
      className={cn(
        "relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl cursor-pointer select-none overflow-visible",
        "flex items-center justify-center shadow-xl",
        "transition-shadow duration-200 hover:shadow-2xl",
        isDisabled && "cursor-not-allowed opacity-60"
      )}
    >
      {/* Pattern texture */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden text-white/50">
        <PatternOverlay pattern={colorData.pattern} />
      </div>
      
      {/* Highlight shine */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent",
        isSelected ? "opacity-0" : "opacity-60"
      )} />
      
      {/* 3D shadow effect */}
      <div className="absolute -bottom-1 left-1 right-1 h-3 bg-black/20 rounded-b-2xl blur-sm" />
      
      {/* Googly Eyes */}
      {!isSelected && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <GooglyEye size="md" lookAt={lookAt} />
          <GooglyEye size="md" lookAt={lookAt} />
        </div>
      )}
      
      {/* Little arms for personality */}
      {hasArms && !isSelected && (
        <>
          <motion.div
            className="absolute -left-2 top-1/2 w-3 h-6 rounded-full"
            style={{ backgroundColor: colorData.bg }}
            animate={{ rotate: [-20, 20] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-2 top-1/2 w-3 h-6 rounded-full"
            style={{ backgroundColor: colorData.bg }}
            animate={{ rotate: [20, -20] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.1 }}
          />
        </>
      )}
      
      {/* The Letter */}
      <motion.span 
        className={cn(
          "relative z-10 text-3xl sm:text-4xl font-black drop-shadow-lg",
          isSelected ? "text-gray-400" : "text-white"
        )}
        style={{
          textShadow: isSelected ? "none" : "2px 2px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)",
        }}
        animate={!isSelected ? { y: [-2, 2] } : {}}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {letter}
      </motion.span>
    </motion.button>
  );
}

// Selected letter slot with bounce-in animation
function LetterSlot({
  letter,
  index,
  filled,
}: {
  letter: string;
  index: number;
  filled: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all relative overflow-hidden",
        filled
          ? "bg-black text-white border-black shadow-xl"
          : "bg-white/50 border-gray-300 border-dashed"
      )}
    >
      <AnimatePresence mode="wait">
        {letter && (
          <motion.span
            key={letter}
            initial={{ y: -30, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onAnimationComplete={() => {
              if (filled) sounds.snap();
            }}
          >
            {letter}
          </motion.span>
        )}
      </AnimatePresence>
      
      {/* Pulse effect when waiting for letter */}
      {!filled && (
        <motion.div
          className="absolute inset-0 border-3 border-[#6C5CE7] rounded-2xl"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2,
          }}
        />
      )}
    </motion.div>
  );
}

export function ScrambleGame({ words, timeLimit, onComplete, onWordComplete, onRestart }: ScrambleGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ letter: string; color: typeof MONSTER_COLORS[0] }[]>([]);
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
    return shuffled.map(letter => ({
      letter,
      color: MONSTER_COLORS[Math.floor(Math.random() * MONSTER_COLORS.length)],
    }));
  }, []);

  useEffect(() => {
    if (currentWord) {
      setScrambledLetters(scrambleWord(currentWord.word));
      setSelectedIndices([]);
      setShowHint(false);
      setTimeout(() => speak(currentWord.hint), 500);
    }
  }, [currentWord, scrambleWord]);

  useEffect(() => {
    if (gameEnded) return;
    
    if (timeLeft <= 0) {
      setShowTimeUp(true);
      setGameEnded(true);
      sounds.wrong();
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
      sounds.bubble();
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      if (newSelected.length === currentWord.word.length) {
        const guessedWord = newSelected.map((i) => scrambledLetters[i].letter).join("");
        
        if (guessedWord === currentWord.word) {
          setShowSuccess(true);
          sounds.celebrate();
          speak(currentWord.word);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#6C5CE7"] });

          setTimeout(() => {
            setShowSuccess(false);
            if (currentIndex < words.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              onWordComplete();
            } else {
              setGameEnded(true);
              onComplete(hintsUsed === 0);
            }
          }, 1500);
        } else {
          setShake(true);
          sounds.wrong();
          setTimeout(() => {
            setShake(false);
            setSelectedIndices([]);
          }, 500);
        }
      }
    }
  };

  const handleReshuffle = () => {
    if (gameEnded) return;
    sounds.whoosh();
    setScrambledLetters(scrambleWord(currentWord.word));
    setSelectedIndices([]);
  };

  const handleShowHint = () => {
    if (gameEnded) return;
    sounds.boing();
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);
    speak(currentWord.hint);
  };

  const timePercentage = (timeLeft / timeLimit) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center bg-gradient-to-b from-sky-100 via-white to-amber-50 overflow-hidden">
      {/* Decorative stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-2xl"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
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

      {/* Timer Bar */}
      <div className="w-full h-2 bg-gray-100 relative z-10">
        <motion.div
          className={cn("h-full", isLowTime ? "bg-red-500" : "bg-gradient-to-r from-[#4ECDC4] to-[#6C5CE7]")}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="w-full px-4 pt-4 pb-2 flex items-center justify-between relative z-10">
        <motion.div 
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg",
            isLowTime ? "bg-red-500 text-white" : "bg-white/80 text-gray-800 shadow-lg"
          )}
        >
          <Clock className="w-5 h-5" />
          {timeLeft}s
        </motion.div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleReshuffle}
            disabled={gameEnded}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full bg-white/80 text-gray-600 hover:bg-white shadow-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={handleShowHint}
            disabled={showHint || gameEnded}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "p-3 rounded-full shadow-lg transition-colors",
              showHint || gameEnded ? "bg-gray-200 text-gray-400" : "bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600"
            )}
          >
            <Lightbulb className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 px-4 mb-4 relative z-10">
        {words.map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "w-3.5 h-3.5 rounded-full transition-all shadow-md",
              i < currentIndex ? "bg-gradient-to-br from-green-400 to-emerald-500" : 
              i === currentIndex ? "bg-gradient-to-br from-[#6C5CE7] to-[#a855f7]" : 
              "bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 w-full max-w-lg relative z-10">
        <motion.div 
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" />
            Unscramble!
            <Sparkles className="w-8 h-8 text-amber-500" />
          </h2>
          <p className="text-gray-600 text-base font-medium">Tap the letters in order</p>
        </motion.div>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-2xl px-6 py-4 mb-6 shadow-xl border-2 border-amber-200"
            >
              <p className="text-amber-800 font-bold text-lg text-center flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                {currentWord.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Letters Display */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="flex gap-2 sm:gap-3 mb-10 min-h-[70px] flex-wrap justify-center"
        >
          {currentWord.word.split("").map((_, i) => (
            <LetterSlot
              key={i}
              letter={selectedIndices[i] !== undefined ? scrambledLetters[selectedIndices[i]].letter : ""}
              index={i}
              filled={selectedIndices[i] !== undefined}
              isLast={i === selectedIndices.length - 1}
            />
          ))}
        </motion.div>

        {/* Monster Letters */}
        <motion.div 
          className="flex gap-3 sm:gap-4 flex-wrap justify-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {scrambledLetters.map((item, i) => (
            <MonsterLetter
              key={`${item.letter}-${i}`}
              letter={item.letter}
              index={i}
              isSelected={selectedIndices.includes(i)}
              isDisabled={showSuccess || gameEnded}
              onClick={() => handleLetterClick(i)}
              colorData={item.color}
            />
          ))}
        </motion.div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-5xl sm:text-6xl font-black text-gray-800">
                {currentWord.word}
              </h2>
              <p className="text-2xl text-emerald-600 mt-3 font-bold">
                Amazing! 🎉
              </p>
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center px-6"
            >
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
                <Clock className="w-14 h-14 text-gray-400" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-800 mb-3">Time's Up!</h2>
              <p className="text-gray-500 mb-10 text-xl">
                You completed {currentIndex} of {words.length} words
              </p>
              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-[#6C5CE7] to-[#a855f7] text-white rounded-2xl font-bold hover:from-[#5b4cdb] hover:to-[#9333ea] transition-all flex items-center gap-3 mx-auto cursor-pointer text-xl shadow-xl"
              >
                <RotateCcw className="w-6 h-6" />
                Try Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Info */}
      <div className="w-full px-4 py-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto text-sm text-gray-600">
          <span className="font-bold text-base">Word {currentIndex + 1} of {words.length}</span>
          {hintsUsed > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <Lightbulb className="w-4 h-4" />
              {hintsUsed} hint{hintsUsed > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
