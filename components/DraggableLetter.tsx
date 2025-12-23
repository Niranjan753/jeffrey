"use client";

import { motion, PanInfo } from "framer-motion";
import { useState, useEffect } from "react";
import { cn, speak } from "@/lib/utils";

interface DraggableLetterProps {
  letter: string;
  id: string;
  onDrop: (id: string, x: number, y: number) => void;
  status: "idle" | "correct" | "incorrect";
  initialX: number;
  initialY: number;
  color: string;
}

export const DraggableLetter = ({
  letter,
  id,
  onDrop,
  status,
  initialX,
  initialY,
  color,
}: DraggableLetterProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [initialRotation] = useState(() => Math.random() * 40 - 20); // Random rotation between -20 and 20
  
  // Handle the repeating pronunciation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && status !== "correct") {
      // Speak immediately
      speak(letter.toLowerCase());
      
      // Then repeat every 2 seconds
      interval = setInterval(() => {
        speak(letter.toLowerCase());
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        // We don't call cancel() here because we want the last utterance to finish
        // unless a new one starts (which speak() handles with cancel())
      }
    };
  }, [isActive, letter, status]);

  const handleDragStart = () => {
    setIsDragging(true);
    setIsActive(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setIsActive(false);
    onDrop(id, info.point.x, info.point.y);
  };

  return (
    <motion.div
      drag
      dragMomentum={true}
      dragElastic={0.1}
      dragTransition={{ 
        bounceStiffness: 300, 
        bounceDamping: 20,
        power: 0.2,
        timeConstant: 200
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => !isDragging && setIsActive(false)}
      onPointerCancel={() => setIsActive(false)}
      animate={
        status === "correct"
          ? { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
          : status === "incorrect"
          ? { x: 0, y: 0, scale: 1, rotate: initialRotation, transition: { type: "spring", stiffness: 400, damping: 30 } }
          : { 
              scale: isActive ? 1.2 : 1, 
              rotate: isActive ? 0 : initialRotation,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }
      }
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        backgroundColor: status === "correct" ? "#3B82F6" : status === "incorrect" ? "#EF4444" : color,
      }}
      className={cn(
        "absolute flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl cursor-grab active:cursor-grabbing text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white shadow-[0_3px_0_rgba(0,0,0,0.15)] sm:shadow-[0_4px_0_rgba(0,0,0,0.15)] md:shadow-[0_6px_0_rgba(0,0,0,0.15)] select-none z-10 pointer-events-auto will-change-transform touch-none",
        "before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:right-0.5 before:h-1/2 before:bg-white/30 before:rounded-t-lg sm:before:rounded-t-xl before:pointer-events-none",
        status === "correct" && "cursor-default pointer-events-none shadow-none translate-y-1.5",
        status === "incorrect" && "animate-shake",
        isDragging && "shadow-2xl ring-4 ring-white/50 scale-110 z-50"
      )}
      whileHover={status !== "correct" ? { scale: 1.1, rotate: 0, transition: { type: "spring", stiffness: 400, damping: 25 } } : {}}
      whileTap={status !== "correct" ? { scale: 1.05, transition: { duration: 0.1 } } : {}}
    >
      <span className="relative z-10 drop-shadow-lg">{letter}</span>
      {/* Active indicator */}
      {isActive && status !== "correct" && (
        <motion.div 
          className="absolute inset-0 rounded-2xl lg:rounded-3xl border-4 border-yellow-300 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

