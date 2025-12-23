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
    <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:p-8 max-w-5xl mx-auto">
      <motion.h1 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6 lg:mb-10 drop-shadow-sm text-center uppercase tracking-tighter"
      >
        Select Level
      </motion.h1>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-6 w-full place-items-center">
        {LEVELS.map((l) => {
          const isLocked = l.level > Math.max(0, ...completedLevels) + 1;
          const isCompleted = completedLevels.includes(l.level);
          
          return (
            <motion.button
              key={l.level}
              whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => !isLocked && onSelectLevel(l.level)}
              className={cn(
                "relative w-full aspect-square max-w-[120px] rounded-2xl lg:rounded-[2rem] flex flex-col items-center justify-center transition-all shadow-lg border-4",
                isLocked 
                  ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" 
                  : "cursor-pointer bg-white",
                !isLocked && !isCompleted && "border-blue-400 text-blue-500",
                isCompleted && "bg-green-50 border-green-400 text-green-500"
              )}
              style={!isLocked ? { borderColor: l.theme, color: l.theme } : {}}
            >
              <span className="text-2xl lg:text-4xl font-black">{l.level}</span>
              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest mt-1">Level</span>
              
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg border-2 border-white">
                  <Star className="w-3 h-3 lg:w-4 lg:h-4 text-white fill-white" />
                </div>
              )}
              
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-2xl lg:rounded-[2rem]">
                  <span className="text-xl lg:text-2xl opacity-40">🔒</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      <p className="mt-8 text-gray-400 font-black text-center uppercase tracking-[0.2em] text-[10px]">
        Unlock all adventures!
      </p>
    </div>
  );
};

