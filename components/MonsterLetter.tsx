"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";

interface MonsterLetterProps {
  letter: string;
  index?: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  speakOnClick?: boolean;
  className?: string;
  colorScheme?: "random" | "blue" | "orange" | "green" | "purple" | "pink";
}

// Fun, vibrant colors for monster letters - like Endless Reader!
const MONSTER_COLORS = [
  { bg: "#FF6B6B", eye: "#FFFFFF", pupil: "#2D3436" }, // Coral Red
  { bg: "#4ECDC4", eye: "#FFFFFF", pupil: "#2D3436" }, // Teal
  { bg: "#FFE66D", eye: "#FFFFFF", pupil: "#2D3436" }, // Sunny Yellow
  { bg: "#95E1D3", eye: "#FFFFFF", pupil: "#2D3436" }, // Mint
  { bg: "#F38181", eye: "#FFFFFF", pupil: "#2D3436" }, // Salmon
  { bg: "#AA96DA", eye: "#FFFFFF", pupil: "#2D3436" }, // Lavender
  { bg: "#FCBAD3", eye: "#FFFFFF", pupil: "#2D3436" }, // Pink
  { bg: "#A8D8EA", eye: "#FFFFFF", pupil: "#2D3436" }, // Baby Blue
  { bg: "#FF9F43", eye: "#FFFFFF", pupil: "#2D3436" }, // Orange
  { bg: "#6C5CE7", eye: "#FFFFFF", pupil: "#2D3436" }, // Purple
  { bg: "#00B894", eye: "#FFFFFF", pupil: "#2D3436" }, // Green
  { bg: "#FD79A8", eye: "#FFFFFF", pupil: "#2D3436" }, // Hot Pink
];

// Pattern types for letter textures
const PATTERNS = ["spots", "stripes", "crosshatch", "dots", "zigzag", "none"] as const;

const sizeClasses = {
  sm: { container: "w-12 h-14", text: "text-2xl", eye: "w-3 h-3" },
  md: { container: "w-16 h-18", text: "text-3xl", eye: "w-4 h-4" },
  lg: { container: "w-20 h-24", text: "text-4xl", eye: "w-5 h-5" },
  xl: { container: "w-24 h-28 md:w-28 md:h-32", text: "text-5xl md:text-6xl", eye: "w-6 h-6" },
};

// Googly Eye Component
function GooglyEye({ 
  size, 
  position,
  lookAt,
}: { 
  size: string; 
  position: "left" | "right" | "center";
  lookAt: { x: number; y: number };
}) {
  const positionClass = position === "left" ? "-left-1" : position === "right" ? "-right-1" : "left-1/2 -translate-x-1/2";
  
  return (
    <motion.div
      className={cn(
        "absolute -top-2 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-gray-200",
        size,
        positionClass
      )}
      animate={{ rotate: [-3, 3] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {/* Pupil that follows mouse/touch */}
      <motion.div
        className="w-1/2 h-1/2 rounded-full bg-gray-900"
        animate={{
          x: lookAt.x * 2,
          y: lookAt.y * 2,
        }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
}

// Pattern overlay for texture
function PatternOverlay({ pattern }: { pattern: typeof PATTERNS[number] }) {
  if (pattern === "none") return null;
  
  const patternContent = {
    spots: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        <circle cx="20" cy="30" r="8" fill="currentColor" />
        <circle cx="70" cy="20" r="6" fill="currentColor" />
        <circle cx="50" cy="60" r="10" fill="currentColor" />
        <circle cx="80" cy="70" r="7" fill="currentColor" />
        <circle cx="30" cy="80" r="5" fill="currentColor" />
      </svg>
    ),
    stripes: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
        <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="8" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="8" />
        <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="8" />
      </svg>
    ),
    crosshatch: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="3" />
        <line x1="25" y1="0" x2="100" y2="75" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="0" x2="100" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="0" y1="25" x2="75" y2="100" stroke="currentColor" strokeWidth="3" />
        <line x1="0" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="3" />
        <line x1="75" y1="0" x2="0" y2="75" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
        {[...Array(16)].map((_, i) => (
          <circle 
            key={i} 
            cx={15 + (i % 4) * 25} 
            cy={15 + Math.floor(i / 4) * 25} 
            r="4" 
            fill="currentColor" 
          />
        ))}
      </svg>
    ),
    zigzag: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
        <polyline points="0,30 20,10 40,30 60,10 80,30 100,10" fill="none" stroke="currentColor" strokeWidth="4" />
        <polyline points="0,60 20,40 40,60 60,40 80,60 100,40" fill="none" stroke="currentColor" strokeWidth="4" />
        <polyline points="0,90 20,70 40,90 60,70 80,90 100,70" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    ),
  };
  
  return patternContent[pattern] || null;
}

export function MonsterLetter({
  letter,
  index = 0,
  isSelected = false,
  isDisabled = false,
  isCorrect = false,
  isWrong = false,
  size = "lg",
  onClick,
  speakOnClick = true,
  className,
  colorScheme = "random",
}: MonsterLetterProps) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLButtonElement>(null);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const [color] = useState(() => {
    if (colorScheme === "random") {
      return MONSTER_COLORS[Math.floor(Math.random() * MONSTER_COLORS.length)];
    }
    const colorMap: Record<string, typeof MONSTER_COLORS[0]> = {
      blue: MONSTER_COLORS[7],
      orange: MONSTER_COLORS[8],
      green: MONSTER_COLORS[10],
      purple: MONSTER_COLORS[9],
      pink: MONSTER_COLORS[11],
    };
    return colorMap[colorScheme] || MONSTER_COLORS[0];
  });
  const [pattern] = useState<typeof PATTERNS[number]>(() => 
    PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
  );
  const [hasEyes] = useState(() => Math.random() > 0.3); // 70% chance of eyes
  const [hasArms] = useState(() => Math.random() > 0.5);
  const [wiggleDelay] = useState(() => Math.random() * 0.5);

  // Initial entrance animation
  useEffect(() => {
    controls.start({
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
      },
    });
  }, [controls, index]);

  // Track mouse/touch for googly eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0]?.clientX || centerX;
        clientY = e.touches[0]?.clientY || centerY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
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

  // Correct/Wrong animations
  useEffect(() => {
    if (isCorrect) {
      sounds.success();
      controls.start({
        scale: 1.2,
        transition: { duration: 0.4, ease: "easeOut" },
      });
    } else if (isWrong) {
      sounds.wrong();
      controls.start({
        x: [-15, 15, -10, 10, 0],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }
  }, [isCorrect, isWrong, controls]);

  const handleClick = () => {
    if (isDisabled) return;

    // Play the letter's unique sound - each letter has personality like Endless Reader!
    sounds.letterSound(letter);
    sounds.pop();
    if (speakOnClick) {
      speak(letter.toLowerCase());
    }

    // Excited bounce animation
    controls.start({
      scale: [1, 0.85, 1.15, 1],
      transition: { duration: 0.35, ease: "easeOut" },
    });

    onClick?.();
  };

  const sizeConfig = sizeClasses[size];

  return (
    <motion.button
      ref={containerRef}
      initial={{ scale: 0, rotate: -90, opacity: 0 }}
      animate={controls}
      whileHover={!isDisabled && !isSelected ? {
        scale: 1.12,
        transition: { duration: 0.2 },
      } : {}}
      whileTap={!isDisabled ? { scale: 0.9 } : {}}
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        backgroundColor: isSelected ? "#E5E7EB" : isCorrect ? "#000000" : color.bg,
      }}
      className={cn(
        sizeConfig.container,
        "relative rounded-2xl cursor-pointer select-none overflow-visible",
        "flex items-center justify-center shadow-xl",
        "transition-shadow duration-200 hover:shadow-2xl",
        isDisabled && "cursor-not-allowed opacity-60",
        isCorrect && "ring-4 ring-yellow-400",
        className
      )}
    >
      {/* Pattern texture overlay */}
      <PatternOverlay pattern={pattern} />
      
      {/* Highlight/shine */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent",
        isSelected ? "opacity-0" : "opacity-60"
      )} />
      
      {/* Bottom shadow for 3D effect */}
      <div className="absolute -bottom-1 left-1 right-1 h-3 bg-black/20 rounded-b-2xl blur-sm" />
      
      {/* Googly Eyes */}
      {hasEyes && !isSelected && (
        <>
          <GooglyEye size={sizeConfig.eye} position="left" lookAt={lookAt} />
          <GooglyEye size={sizeConfig.eye} position="right" lookAt={lookAt} />
        </>
      )}
      
      {/* Single center eye for some letters (like O) */}
      {!hasEyes && letter.toUpperCase() === 'O' && !isSelected && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-gray-200"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="w-4 h-4 rounded-full bg-gray-900"
            animate={{
              x: lookAt.x * 4,
              y: lookAt.y * 4,
            }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </motion.div>
      )}
      
      {/* The Letter */}
      <motion.span
        className={cn(
          sizeConfig.text,
          "relative z-10 font-black drop-shadow-lg",
          isSelected ? "text-gray-400" : isCorrect ? "text-white" : "text-white"
        )}
        style={{
          textShadow: isCorrect ? "none" : "2px 2px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)",
        }}
        animate={!isSelected && !isCorrect ? { y: [-2, 2] } : {}}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: wiggleDelay,
        }}
      >
        {letter}
      </motion.span>
      
      {/* Little arms/appendages for character feel */}
      {hasArms && !isSelected && !isCorrect && (
        <>
          <motion.div
            className="absolute -left-2 top-1/2 w-3 h-6 rounded-full"
            style={{ backgroundColor: color.bg }}
            animate={{ rotate: [-15, 15] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -right-2 top-1/2 w-3 h-6 rounded-full"
            style={{ backgroundColor: color.bg }}
            animate={{ rotate: [15, -15] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.15,
            }}
          />
        </>
      )}
      
      {/* Sparkles on correct */}
      {isCorrect && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              style={{ left: "50%", top: "50%" }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 50,
                y: Math.sin((i * Math.PI) / 4) * 50,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.04,
                ease: "easeOut",
              }}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.button>
  );
}

// Word component that uses MonsterLetters
export function MonsterWord({
  word,
  selectedIndices = [],
  onLetterClick,
  size = "lg",
}: {
  word: string;
  selectedIndices?: number[];
  onLetterClick?: (index: number) => void;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <motion.div 
      className="flex gap-2 flex-wrap justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {word.split("").map((letter, i) => (
        <MonsterLetter
          key={`${letter}-${i}`}
          letter={letter}
          index={i}
          isSelected={selectedIndices.includes(i)}
          size={size}
          onClick={() => onLetterClick?.(i)}
        />
      ))}
    </motion.div>
  );
}
