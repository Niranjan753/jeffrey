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
        "w-20 h-20 lg:w-24 lg:h-24 border-4 border-dashed rounded-2xl lg:rounded-3xl flex items-center justify-center text-4xl lg:text-5xl font-black transition-all duration-300",
        isFilled 
          ? "border-transparent bg-blue-500 text-white shadow-[0_4px_0_rgb(30,64,175)]" 
          : "border-gray-200 bg-gray-50/50 text-transparent"
      )}
    >
      <span className={cn(isFilled ? "opacity-100" : "opacity-20 text-gray-400")}>
        {letter}
      </span>
    </div>
  );
};

