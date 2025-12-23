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
        "relative w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 border-2 sm:border-2 md:border-3 lg:border-4 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black transition-all duration-300 ease-out will-change-transform",
        isFilled 
          ? "border-transparent bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-[0_2px_0_rgb(30,64,175)] sm:shadow-[0_3px_0_rgb(30,64,175)] md:shadow-[0_4px_0_rgb(30,64,175)] scale-105" 
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

