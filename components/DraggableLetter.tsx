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
}: DraggableLetterProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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
          ? { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
          : status === "incorrect"
          ? { x: 0, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
          : { 
              scale: isActive ? 1.1 : 1, 
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }
      }
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      className={cn(
        "absolute flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl cursor-grab active:cursor-grabbing text-xl sm:text-2xl md:text-3xl font-bold select-none z-10 pointer-events-auto will-change-transform touch-none transition-colors",
        status === "correct" && "bg-black text-white cursor-default pointer-events-none",
        status === "incorrect" && "bg-gray-300 text-gray-600 animate-shake",
        status === "idle" && "bg-[#0a33ff] text-white shadow-lg",
        isDragging && "shadow-2xl ring-2 ring-black/20 z-50"
      )}
      whileHover={status !== "correct" ? { scale: 1.05 } : {}}
      whileTap={status !== "correct" ? { scale: 0.98 } : {}}
    >
      <span className="relative z-10">{letter}</span>
      {isActive && status !== "correct" && (
        <motion.div 
          className="absolute inset-0 rounded-xl border-2 border-black pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};
