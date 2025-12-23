"use client";

import { LEVELS } from "@/data/levels";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface LevelSelectorProps {
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
}

export const LevelSelector = ({ completedLevels, onSelectLevel }: LevelSelectorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <motion.h1 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-12 drop-shadow-sm"
      >
        WORD MAGIC
      </motion.h1>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl">
        {LEVELS.map((l) => {
          const isLocked = l.level > Math.max(0, ...completedLevels) + 1;
          const isCompleted = completedLevels.includes(l.level);
          
          return (
            <motion.button
              key={l.level}
              whileHover={!isLocked ? { scale: 1.1, rotate: 2 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => !isLocked && onSelectLevel(l.level)}
              className={cn(
                "relative w-32 h-32 rounded-3xl flex flex-col items-center justify-center transition-all shadow-xl border-4",
                isLocked 
                  ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" 
                  : "cursor-pointer",
                !isLocked && !isCompleted && "bg-white border-blue-400 text-blue-500",
                isCompleted && "bg-green-50 border-green-400 text-green-500"
              )}
              style={!isLocked ? { borderColor: l.theme, color: l.theme } : {}}
            >
              <span className="text-4xl font-black mb-1">{l.level}</span>
              <span className="text-xs font-bold uppercase tracking-widest">Level</span>
              
              {isCompleted && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2 shadow-lg">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              )}
              
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-3xl">
                  <span className="text-4xl">🔒</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      <p className="mt-16 text-gray-400 font-medium">Complete levels to unlock new adventures!</p>
    </div>
  );
};

