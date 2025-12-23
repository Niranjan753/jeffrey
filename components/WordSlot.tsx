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
        "relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 sm:border-2 md:border-3 lg:border-4 rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-black transition-all duration-300 ease-out will-change-transform",
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

