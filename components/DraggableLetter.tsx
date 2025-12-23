"use client";

import { motion, PanInfo } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [isDragging, setIsDragging] = useState(false);
  const [initialRotation] = useState(() => Math.random() * 40 - 20); // Random rotation between -20 and 20
  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    onDrop(id, info.point.x, info.point.y);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={
        status === "correct"
          ? { scale: 1, opacity: 1, rotate: 0 }
          : status === "incorrect"
          ? { x: 0, y: 0, scale: 1, rotate: initialRotation }
          : { 
              scale: isDragging ? 1.2 : 1, 
              rotate: isDragging ? 0 : initialRotation 
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

