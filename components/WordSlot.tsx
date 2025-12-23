"use client";

import { cn } from "@/lib/utils";

interface WordSlotProps {
  letter: string;
  isFilled: boolean;
}

export const WordSlot = ({ letter, isFilled }: WordSlotProps) => {
  return (
    <div
      className={cn(
        "relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-3 sm:border-4 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-black transition-all duration-300 ease-out will-change-transform",
        isFilled 
          ? "border-transparent bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-[0_4px_0_rgb(30,64,175)] sm:shadow-[0_6px_0_rgb(30,64,175)] scale-105" 
          : "border-dashed border-gray-300 bg-white/60 backdrop-blur-sm text-transparent shadow-sm hover:border-gray-400 hover:shadow-md"
      )}
    >
      {/* Shine effect when filled */}
      {isFilled && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl lg:rounded-3xl pointer-events-none" />
      )}
      <span className={cn(
        "relative z-10",
        isFilled ? "opacity-100" : "opacity-15 text-gray-400"
      )}>
        {letter}
      </span>
    </div>
  );
};

