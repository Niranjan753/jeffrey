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
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={() => setIsActive(true)}
      onPointerUp={() => !isDragging && setIsActive(false)}
      onPointerCancel={() => setIsActive(false)}
      animate={
        status === "correct"
          ? { scale: 1, opacity: 1, rotate: 0 }
          : status === "incorrect"
          ? { x: 0, y: 0, scale: 1, rotate: initialRotation }
          : { 
              scale: isActive ? 1.2 : 1, 
              rotate: isActive ? 0 : initialRotation 
            }
      }
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        backgroundColor: status === "correct" ? "#3B82F6" : status === "incorrect" ? "#EF4444" : color,
      }}
      className={cn(
        "absolute flex items-center justify-center w-16 h-16 rounded-2xl cursor-grab active:cursor-grabbing text-3xl font-bold text-white shadow-[0_8px_0_rgb(0,0,0,0.1)] select-none z-10 pointer-events-auto",
        "before:content-[''] before:absolute before:top-1 before:left-1 before:right-1 before:h-1/2 before:bg-white/20 before:rounded-t-xl",
        status === "correct" && "cursor-default pointer-events-none shadow-none translate-y-[4px]",
        status === "incorrect" && "animate-shake"
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {letter}
    </motion.div>
  );
};

