"use client";

import { motion, PanInfo } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";

interface DraggableLetterProps {
  letter: string;
  id: string;
  onDrop: (id: string, x: number, y: number) => void;
  status: "idle" | "correct" | "incorrect";
  initialX: number;
  initialY: number;
  color: string;
}

// Fun, vibrant colors for monster letters - like Endless Reader!
const MONSTER_COLORS = [
  { bg: "#FF6B6B", pattern: "spots" },    // Coral Red
  { bg: "#4ECDC4", pattern: "stripes" },  // Teal
  { bg: "#FFE66D", pattern: "dots" },     // Sunny Yellow
  { bg: "#95E1D3", pattern: "zigzag" },   // Mint
  { bg: "#F38181", pattern: "crosshatch" }, // Salmon
  { bg: "#AA96DA", pattern: "spots" },    // Lavender
  { bg: "#FCBAD3", pattern: "stripes" },  // Pink
  { bg: "#A8D8EA", pattern: "dots" },     // Baby Blue
  { bg: "#FF9F43", pattern: "spots" },    // Orange
  { bg: "#6C5CE7", pattern: "crosshatch" }, // Purple
  { bg: "#00B894", pattern: "zigzag" },   // Green
  { bg: "#FD79A8", pattern: "dots" },     // Hot Pink
];

// Googly Eye Component
function GooglyEye({ lookAt, size = "md" }: { lookAt: { x: number; y: number }; size?: "sm" | "md" | "lg" }) {
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
        "rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-gray-100",
        sizeClasses[size]
      )}
      animate={{
        rotate: [0, -3, 3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className={cn("rounded-full bg-gray-900", pupilSizes[size])}
        animate={{
          x: lookAt.x * 3,
          y: lookAt.y * 3,
        }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
}

// Pattern SVG overlays for texture
function PatternOverlay({ pattern }: { pattern: string }) {
  const patterns: Record<string, React.ReactNode> = {
    spots: (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="25" cy="30" r="12" fill="currentColor" />
        <circle cx="75" cy="25" r="10" fill="currentColor" />
        <circle cx="50" cy="70" r="14" fill="currentColor" />
        <circle cx="80" cy="75" r="8" fill="currentColor" />
      </svg>
    ),
    stripes: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="12" />
        <line x1="0" y1="55" x2="100" y2="55" stroke="currentColor" strokeWidth="12" />
        <line x1="0" y1="85" x2="100" y2="85" stroke="currentColor" strokeWidth="12" />
      </svg>
    ),
    crosshatch: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="5" />
        <line x1="35" y1="0" x2="100" y2="65" stroke="currentColor" strokeWidth="5" />
        <line x1="0" y1="35" x2="65" y2="100" stroke="currentColor" strokeWidth="5" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="5" />
        <line x1="65" y1="0" x2="0" y2="65" stroke="currentColor" strokeWidth="5" />
      </svg>
    ),
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={20 + (i % 3) * 30} cy={20 + Math.floor(i / 3) * 30} r="6" fill="currentColor" />
        ))}
      </svg>
    ),
    zigzag: (
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="0,30 25,10 50,30 75,10 100,30" fill="none" stroke="currentColor" strokeWidth="6" />
        <polyline points="0,65 25,45 50,65 75,45 100,65" fill="none" stroke="currentColor" strokeWidth="6" />
      </svg>
    ),
  };
  
  return patterns[pattern] || null;
}

// Endless Reader style - letters are alive and bouncy with googly eyes!
export const DraggableLetter = ({
  letter,
  id,
  onDrop,
  status,
  initialX,
  initialY,
}: DraggableLetterProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lookAt, setLookAt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get random color and pattern for this letter - stable per letter
  const [colorData] = useState(() => MONSTER_COLORS[Math.floor(Math.random() * MONSTER_COLORS.length)]);
  const [hasArms] = useState(() => Math.random() > 0.5);
  const [wiggleDelay] = useState(() => Math.random() * 0.5);

  // Track mouse/touch for googly eyes
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

  // Speak letter when active
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && status !== "correct") {
      speak(letter.toLowerCase());
      interval = setInterval(() => {
        speak(letter.toLowerCase());
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, letter, status]);

  const handleDragStart = () => {
    setIsDragging(true);
    setIsActive(true);
    sounds.whoosh();
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setIsActive(false);
    sounds.bounce();
    onDrop(id, info.point.x, info.point.y);
  };

  const handlePointerDown = () => {
    setIsActive(true);
    // Play the letter's unique sound - each letter has personality!
    sounds.letterSound(letter);
    sounds.pop();
  };

  return (
    <motion.div
      ref={containerRef}
      drag
      dragMomentum={true}
      dragElastic={0.15}
      dragTransition={{ 
        bounceStiffness: 400, 
        bounceDamping: 25,
        power: 0.3,
        timeConstant: 150
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerUp={() => !isDragging && setIsActive(false)}
      onPointerCancel={() => setIsActive(false)}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ 
        scale: status === "correct" ? 1.1 : 1,
        opacity: 1,
        rotate: 0,
      }}
      transition={{
        duration: 0.5,
        delay: wiggleDelay,
        ease: "easeOut",
      }}
      whileHover={status !== "correct" ? {
        scale: 1.12,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={status !== "correct" ? { scale: 0.92 } : {}}
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        backgroundColor: status === "correct" ? "#000000" : colorData.bg,
      }}
      className={cn(
        "absolute flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-2xl cursor-grab active:cursor-grabbing text-3xl sm:text-4xl font-black select-none z-10 pointer-events-auto will-change-transform touch-none overflow-visible shadow-xl",
        status === "correct" && "cursor-default pointer-events-none ring-4 ring-yellow-400",
        status === "incorrect" && "animate-shake",
        isDragging && "shadow-2xl z-50 cursor-grabbing"
      )}
    >
      {/* Pattern texture overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden text-white/50">
        <PatternOverlay pattern={colorData.pattern} />
      </div>
      
      {/* Inner shine effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent",
          status === "correct" ? "opacity-30" : "opacity-60"
        )}
      />
      
      {/* 3D shadow */}
      <div className="absolute -bottom-1 left-1 right-1 h-3 bg-black/20 rounded-b-2xl blur-sm" />
      
      {/* Googly Eyes - only when not correct */}
      {status !== "correct" && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <GooglyEye lookAt={lookAt} size="md" />
          <GooglyEye lookAt={lookAt} size="md" />
        </div>
      )}
      
      {/* Little arms for character feel */}
      {hasArms && status !== "correct" && (
        <>
          <motion.div
            className="absolute -left-2 top-1/2 w-3 h-6 rounded-full shadow-md"
            style={{ backgroundColor: colorData.bg }}
            animate={{
              rotate: isDragging ? [-30, 30] : [-20, 20],
            }}
            transition={{
              duration: isDragging ? 0.2 : 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -right-2 top-1/2 w-3 h-6 rounded-full shadow-md"
            style={{ backgroundColor: colorData.bg }}
            animate={{
              rotate: isDragging ? [30, -30] : [20, -20],
            }}
            transition={{
              duration: isDragging ? 0.2 : 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.1,
            }}
          />
        </>
      )}
      
      {/* The letter itself with subtle floating */}
      <motion.span 
        className="relative z-10 drop-shadow-lg text-white"
        style={{
          textShadow: "2px 2px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)",
        }}
        animate={status !== "correct" && !isDragging ? {
          y: [-3, 3],
          rotate: [-2, 2],
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: wiggleDelay,
        }}
      >
        {letter}
      </motion.span>
      
      {/* Active ring indicator */}
      {isActive && status !== "correct" && (
        <motion.div 
          className="absolute inset-0 rounded-2xl border-4 border-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.4, 0.8],
            scale: [0.98, 1.02],
          }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Sparkles/Stars on correct */}
      {status === "correct" && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ left: "50%", top: "50%" }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 60,
                y: Math.sin((i * Math.PI) / 4) * 60,
                scale: [0, 1.2, 0],
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
    </motion.div>
  );
};
