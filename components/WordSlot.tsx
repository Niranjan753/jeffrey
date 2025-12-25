"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WordSlotProps {
  letter: string;
  isFilled: boolean;
}

export const WordSlot = ({ letter, isFilled }: WordSlotProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative w-14 h-16 sm:w-16 sm:h-18 md:w-18 md:h-20 border-3 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-black transition-all duration-200 overflow-hidden shadow-lg",
        isFilled 
          ? "border-black bg-black text-white" 
          : "border-gray-300 border-dashed bg-white/70"
      )}
    >
      {/* Shine effect when filled */}
      {isFilled && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-2xl" />
      )}
      
      {/* 3D shadow effect */}
      {isFilled && (
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/30 rounded-b-2xl blur-sm" />
      )}
      
      {/* Pulsing border when empty (waiting for letter) */}
      {!isFilled && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-3 border-[#6C5CE7]"
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* The letter with bounce-in animation */}
      <AnimatePresence mode="wait">
        {isFilled ? (
          <motion.span
            key="filled"
            initial={{ y: -25, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 25, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 drop-shadow-md"
            style={{
              textShadow: "1px 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {letter}
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            className="opacity-15 text-gray-400"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {letter}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
