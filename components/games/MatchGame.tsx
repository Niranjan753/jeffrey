"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn, shuffleArray, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import confetti from "canvas-confetti";
import Image from "next/image";

interface MatchPair {
  word: string;
  image: string;
}

interface MatchGameProps {
  pairs: MatchPair[];
  onComplete: (perfect: boolean) => void;
}

interface CardData {
  id: string;
  type: "word" | "image";
  content: string;
  pairId: string;
}

// Fun, vibrant colors for words - like Endless Reader!
const WORD_COLORS = [
  { bg: "#FF6B6B", pattern: "spots" },
  { bg: "#4ECDC4", pattern: "stripes" },
  { bg: "#FFE66D", pattern: "dots" },
  { bg: "#AA96DA", pattern: "crosshatch" },
  { bg: "#FF9F43", pattern: "spots" },
  { bg: "#6C5CE7", pattern: "zigzag" },
  { bg: "#00B894", pattern: "stripes" },
  { bg: "#FD79A8", pattern: "dots" },
];

// Googly Eye Component
function GooglyEye({ lookAt, size = "sm" }: { lookAt: { x: number; y: number }; size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };
  
  return (
    <motion.div
      className={cn(
        "rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-200",
        sizeClasses[size]
      )}
      animate={{ rotate: [-1, 1] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-gray-900"
        animate={{
          x: lookAt.x * 2,
          y: lookAt.y * 2,
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// Pattern SVG overlays for texture on words
function PatternOverlay({ pattern }: { pattern: string }) {
  const patterns: Record<string, React.ReactNode> = {
    spots: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 50" preserveAspectRatio="none">
        <circle cx="15" cy="15" r="8" fill="currentColor" />
        <circle cx="50" cy="30" r="10" fill="currentColor" />
        <circle cx="85" cy="15" r="7" fill="currentColor" />
      </svg>
    ),
    stripes: (
      <svg className="absolute inset-0 w-full h-full opacity-12" viewBox="0 0 100 50" preserveAspectRatio="none">
        <line x1="0" y1="15" x2="100" y2="15" stroke="currentColor" strokeWidth="8" />
        <line x1="0" y1="35" x2="100" y2="35" stroke="currentColor" strokeWidth="8" />
      </svg>
    ),
    crosshatch: (
      <svg className="absolute inset-0 w-full h-full opacity-12" viewBox="0 0 100 50" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="25" y1="0" x2="75" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="0" x2="100" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="100" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="75" y1="0" x2="25" y2="50" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 50" preserveAspectRatio="none">
        {[...Array(6)].map((_, i) => (
          <circle key={i} cx={15 + (i % 3) * 35} cy={15 + Math.floor(i / 3) * 20} r="4" fill="currentColor" />
        ))}
      </svg>
    ),
    zigzag: (
      <svg className="absolute inset-0 w-full h-full opacity-12" viewBox="0 0 100 50" preserveAspectRatio="none">
        <polyline points="0,20 20,10 40,20 60,10 80,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" />
        <polyline points="0,40 20,30 40,40 60,30 80,40 100,30" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  };
  
  return patterns[pattern] || null;
}

// Animated Word Button with personality - like Endless Reader!
function MonsterWordButton({
  word,
  isSelected,
  isMatched,
  onClick,
  index,
  colorData,
}: {
  word: string;
  isSelected: boolean;
  isMatched: boolean;
  isJustMatched: boolean;
  onClick: () => void;
  index: number;
  colorData: { bg: string; pattern: string };
}) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });

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
      
      const deltaX = (clientX - centerX) / 150;
      const deltaY = (clientY - centerY) / 150;
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
    // Play sounds for each letter in the word - like Endless Reader!
    sounds.wordSound(word, 80);
    sounds.pop();
    speak(word);
    onClick();
  };

  return (
    <motion.button
      ref={containerRef}
      initial={{ opacity: 0, x: -30, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={!isMatched ? { scale: 1.08 } : {}}
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      disabled={isMatched}
      style={{ backgroundColor: isMatched ? "#000000" : colorData.bg }}
      className={cn(
        "relative px-6 py-4 rounded-2xl font-black text-xl transition-all min-w-[130px] overflow-visible shadow-xl",
        isMatched
          ? "cursor-default ring-4 ring-yellow-400"
          : isSelected
            ? "ring-4 ring-white ring-offset-2 ring-offset-gray-100"
            : "hover:shadow-2xl"
      )}
    >
      {/* Pattern texture */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden text-white/50">
        <PatternOverlay pattern={colorData.pattern} />
      </div>
      
      {/* Shine effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-b from-white/35 to-transparent",
        isMatched ? "opacity-20" : "opacity-50"
      )} />
      
      {/* 3D shadow */}
      <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/20 rounded-b-2xl blur-sm" />
      
      {/* Googly Eyes on top */}
      {!isMatched && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          <GooglyEye lookAt={lookAt} size="sm" />
          <GooglyEye lookAt={lookAt} size="sm" />
        </div>
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2 text-white drop-shadow-md" style={{
        textShadow: "1px 1px 0 rgba(0,0,0,0.2)",
      }}>
        {isMatched && <Check className="w-5 h-5" />}
        {word}
      </span>
    </motion.button>
  );
}

// Animated image card with bounce
function BouncyImageCard({
  src,
  isSelected,
  isMatched,
  onClick,
  index,
}: {
  src: string;
  isSelected: boolean;
  isMatched: boolean;
  isJustMatched: boolean;
  onClick: () => void;
  index: number;
}) {
  const handleClick = () => {
    sounds.bubble();
    onClick();
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: 30, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={!isMatched ? { scale: 1.1 } : {}}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={isMatched}
      className={cn(
        "w-22 h-22 md:w-26 md:h-26 rounded-2xl overflow-hidden transition-all relative shadow-xl",
        isMatched
          ? "ring-4 ring-black"
          : isSelected
            ? "ring-4 ring-[#6C5CE7] ring-offset-2"
            : "hover:shadow-2xl"
      )}
      style={{ width: 88, height: 88 }}
    >
      <Image src={src} alt="Match" fill className="object-cover" />
      
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      
      {/* Selection overlay */}
      <AnimatePresence>
        {isSelected && !isMatched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#6C5CE7]/30 flex items-center justify-center"
          >
            <span className="text-2xl">👆</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Matched overlay */}
      {isMatched && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

export function MatchGame({ pairs, onComplete }: MatchGameProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [wordColors, setWordColors] = useState<Record<string, typeof WORD_COLORS[0]>>({});
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showWrong, setShowWrong] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  useEffect(() => {
    const wordCards: CardData[] = pairs.map((pair, i) => ({
      id: `word-${i}`,
      type: "word",
      content: pair.word,
      pairId: `pair-${i}`,
    }));
    const imageCards: CardData[] = pairs.map((pair, i) => ({
      id: `image-${i}`,
      type: "image",
      content: pair.image,
      pairId: `pair-${i}`,
    }));
    
    // Assign colors to words
    const colors: Record<string, typeof WORD_COLORS[0]> = {};
    wordCards.forEach((card, i) => {
      colors[card.id] = WORD_COLORS[i % WORD_COLORS.length];
    });
    setWordColors(colors);
    
    setCards([...shuffleArray(wordCards), ...shuffleArray(imageCards)]);
  }, [pairs]);

  const handleCardClick = (card: CardData) => {
    if (matchedPairs.includes(card.pairId)) return;
    
    if (selectedCard && selectedCard.type === card.type) {
      setSelectedCard(card);
      return;
    }

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      if (selectedCard.pairId === card.pairId) {
        const newMatched = [...matchedPairs, card.pairId];
        setMatchedPairs(newMatched);
        setLastMatch(card.pairId);
        setSelectedCard(null);
        sounds.success();
        
        // Find the word and speak it
        const matchedCard = cards.find(c => c.pairId === card.pairId && c.type === "word");
        if (matchedCard) {
          setTimeout(() => speak(matchedCard.content), 300);
        }
        
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6C5CE7", "#00B894"] });
        setTimeout(() => setLastMatch(null), 600);

        if (newMatched.length === pairs.length) {
          setShowSuccess(true);
          sounds.celebrate();
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6C5CE7", "#00B894", "#FD79A8"] });
          setTimeout(() => onComplete(wrongAttempts === 0), 2000);
        }
      } else {
        setWrongAttempts(prev => prev + 1);
        setShowWrong(true);
        sounds.wrong();
        setTimeout(() => {
          setShowWrong(false);
          setSelectedCard(null);
        }, 500);
      }
    }
  };

  const isCardSelected = (card: CardData) => selectedCard?.id === card.id;
  const isCardMatched = (card: CardData) => matchedPairs.includes(card.pairId);
  const isCardJustMatched = (card: CardData) => lastMatch === card.pairId;

  const wordCards = cards.filter(c => c.type === "word");
  const imageCards = cards.filter(c => c.type === "image");

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-sky-100 via-white to-amber-50 overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-xl"
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

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-amber-500" />
            Word Match
          </h2>
          <motion.span 
            className="text-base font-bold px-5 py-2.5 bg-white rounded-full shadow-lg"
            key={matchedPairs.length}
          >
            {matchedPairs.length}/{pairs.length}
          </motion.span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#4ECDC4] via-[#6C5CE7] to-[#FF6B6B] rounded-full"
            animate={{ width: `${(matchedPairs.length / pairs.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-6 py-8 overflow-auto relative z-10">
        {/* Words */}
        <motion.div 
          className="flex flex-wrap md:flex-col gap-4 justify-center"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="w-full text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
            ✨ Words ✨
          </p>
          {wordCards.map((card, i) => (
            <MonsterWordButton
              key={card.id}
              word={card.content}
              isSelected={isCardSelected(card)}
              isMatched={isCardMatched(card)}
              isJustMatched={isCardJustMatched(card)}
              onClick={() => handleCardClick(card)}
              index={i}
              colorData={wordColors[card.id] || WORD_COLORS[0]}
            />
          ))}
        </motion.div>

        {/* Divider */}
        <div className="hidden md:flex flex-col items-center gap-3">
          <div className="w-1.5 h-48 bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100 rounded-full" />
          <span className="text-3xl">🔗</span>
        </div>
        <div className="md:hidden w-3/4 h-1.5 bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100 rounded-full" />

        {/* Images */}
        <motion.div 
          className="flex flex-wrap md:flex-col gap-4 justify-center"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="w-full text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
            🖼️ Pictures 🖼️
          </p>
          {imageCards.map((card, i) => (
            <BouncyImageCard
              key={card.id}
              src={card.content}
              isSelected={isCardSelected(card)}
              isMatched={isCardMatched(card)}
              isJustMatched={isCardJustMatched(card)}
              onClick={() => handleCardClick(card)}
              index={i}
            />
          ))}
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div 
        className="text-center py-4 px-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          <motion.p 
            key={selectedCard?.id || "none"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-base text-gray-600 font-semibold"
          >
            {selectedCard 
              ? `Now tap the matching ${selectedCard.type === "word" ? "picture! 🖼️" : "word! ✨"}`
              : "Tap to match words with pictures! 🎯"}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Wrong Answer Flash */}
      <AnimatePresence>
        {showWrong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/15 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

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
                className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Check className="w-14 h-14 text-white" />
              </motion.div>
              <h2 className="text-5xl sm:text-6xl font-black text-gray-800">
                All Matched!
              </h2>
              <p className="text-2xl text-emerald-600 mt-4 font-bold">
                {wrongAttempts === 0 ? "Perfect score! 🌟" : `Great job! 🎉`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
