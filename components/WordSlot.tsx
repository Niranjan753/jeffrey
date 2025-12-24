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
        "relative w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 rounded-xl flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold transition-all duration-200",
        isFilled 
          ? "border-black bg-black text-white" 
          : "border-gray-300 border-dashed bg-white text-transparent"
      )}
    >
      <span className={cn(
        "relative z-10",
        isFilled ? "opacity-100" : "opacity-10 text-gray-300"
      )}>
        {letter}
      </span>
    </div>
  );
};
