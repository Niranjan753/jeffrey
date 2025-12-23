"use client";

import { LEVELS } from "@/data/levels";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star, Heart, Trophy, ShoppingBag, Calendar, Map as MapIcon, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface LevelMapProps {
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
  scrollToLevel?: number | null;
}

const LEVEL_POSITIONS = [
  { x: 50, y: 92 }, // Level 1
  { x: 75, y: 85 }, // Level 2
  { x: 60, y: 75 }, // Level 3
  { x: 30, y: 68 }, // Level 4
  { x: 20, y: 58 }, // Level 5
  { x: 45, y: 50 }, // Level 6
  { x: 75, y: 42 }, // Level 7
  { x: 65, y: 32 }, // Level 8
  { x: 35, y: 25 }, // Level 9
  { x: 50, y: 15 }, // Level 10
];

export const LevelMap = ({ completedLevels, onSelectLevel, scrollToLevel }: LevelMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (scrollToLevel && levelRefs.current[scrollToLevel]) {
      const levelElement = levelRefs.current[scrollToLevel];
      
      // Find the scrollable parent (the overflow container in dashboard)
      let scrollParent = levelElement.parentElement;
      while (scrollParent) {
        const hasOverflow = window.getComputedStyle(scrollParent).overflowY;
        if (hasOverflow === 'auto' || hasOverflow === 'scroll') {
          break;
        }
        scrollParent = scrollParent.parentElement;
      }
      
      if (scrollParent && levelElement) {
        const levelTop = levelElement.getBoundingClientRect().top;
        const parentTop = scrollParent.getBoundingClientRect().top;
        const parentHeight = scrollParent.clientHeight;
        const currentScroll = scrollParent.scrollTop;
        
        // Calculate target scroll position to center the level
        const targetScroll = currentScroll + levelTop - parentTop - parentHeight / 2;
        
        // Smooth scroll to the target level
        scrollParent.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [scrollToLevel]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[1400px] bg-[#fdf5cc] overflow-hidden flex flex-col">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Top Bar */}
      <div className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full border border-pink-100 shadow-sm">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <span className="font-black text-pink-600">5</span>
            <span className="text-xs font-bold text-pink-400 uppercase">Full</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-100 shadow-sm">
            <div className="w-5 h-5 bg-yellow-400 rounded-sm rotate-45 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 bg-yellow-600 rounded-full" />
            </div>
            <span className="font-black text-yellow-600">587</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-400 overflow-hidden bg-white shadow-sm">
                <Image src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" alt="profile" width={40} height={40} />
            </div>
            <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                <Settings className="w-6 h-6 text-gray-400" />
            </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-grow relative w-full max-w-2xl mx-auto py-20 px-4 overflow-visible">
        {/* Banner */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-10 w-64 h-12 bg-blue-400 border-4 border-white shadow-lg rounded-xl flex items-center justify-center -rotate-2">
            <div className="absolute inset-0 bg-blue-500 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            <span className="relative text-white font-black uppercase tracking-widest text-sm drop-shadow-sm">Bubblegum Hill</span>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-[15%] left-[-20%] w-64 h-64 bg-pink-100/50 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[-20%] w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-10%] w-72 h-72 bg-yellow-100/50 rounded-full blur-3xl" />
        
        {/* Path SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Base path */}
          <path
            d={`M ${LEVEL_POSITIONS.map(p => `${p.x} ${p.y}`).join(' L ')}`}
            fill="none"
            stroke="#fbcfe8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 8"
            className="opacity-50"
          />
          {/* Animated path segment when scrolling to next level */}
          {scrollToLevel && scrollToLevel > 1 && (
            <motion.path
              d={`M ${LEVEL_POSITIONS[scrollToLevel - 2].x} ${LEVEL_POSITIONS[scrollToLevel - 2].y} L ${LEVEL_POSITIONS[scrollToLevel - 1].x} ${LEVEL_POSITIONS[scrollToLevel - 1].y}`}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            />
          )}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Level Nodes */}
        {LEVELS.map((l, index) => {
          const pos = LEVEL_POSITIONS[index];
          const isLocked = l.level > Math.max(0, ...completedLevels) + 1;
          const isCompleted = completedLevels.includes(l.level);
          const isCurrent = l.level === Math.max(0, ...completedLevels) + 1;

          return (
            <motion.div
              key={l.level}
              ref={(el) => { levelRefs.current[l.level] = el; }}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-20"
            >
              <motion.button
                whileHover={!isLocked ? { scale: 1.1 } : {}}
                whileTap={!isLocked ? { scale: 0.9 } : {}}
                onClick={() => !isLocked && onSelectLevel(l.level)}
                className={cn(
                  "group relative flex flex-col items-center",
                  isLocked ? "cursor-not-allowed" : "cursor-pointer"
                )}
              >
                {/* Level Circle */}
                <div className={cn(
                  "w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all shadow-xl border-4 relative overflow-hidden",
                  isLocked 
                    ? "bg-gray-200 border-gray-300" 
                    : isCurrent
                      ? "bg-pink-500 border-white ring-4 ring-pink-200"
                      : isCompleted
                        ? "bg-yellow-400 border-white"
                        : "bg-white border-blue-400"
                )}>
                  <span className={cn(
                    "text-2xl lg:text-3xl font-black transition-all relative z-10",
                    isLocked ? "text-gray-400" : isCurrent ? "text-white" : "text-gray-800"
                  )}>
                    {l.level}
                  </span>
                  
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 rounded-full z-20">
                      <span className="text-xl">🔒</span>
                    </div>
                  )}
                </div>

                {/* Stars below the node */}
                {!isLocked && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-4 h-4 lg:w-5 h-5 transition-colors",
                          isCompleted ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-100"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Current Level Indicator (Avatar) - Only show if not animating */}
                {isCurrent && !scrollToLevel && (
                  <motion.div 
                    animate={{ y: [-10, 0, -10] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-12 lg:-top-16 w-12 h-12 lg:w-16 lg:h-16 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-2xl z-30"
                  >
                    <Image src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" alt="current" fill className="object-cover" />
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          );
        })}

        {/* Decorative Map Elements (Simplified) */}
        <div className="absolute top-[20%] right-[10%] opacity-20 pointer-events-none">
            <Trophy className="w-20 h-20 text-yellow-600" />
        </div>
        <div className="absolute bottom-[30%] left-[15%] opacity-20 pointer-events-none">
            <MapIcon className="w-16 h-16 text-blue-600" />
        </div>

        {/* Animated Avatar moving from previous to next level */}
        {scrollToLevel && scrollToLevel > 1 && (
          <motion.div
            initial={{ 
              left: `${LEVEL_POSITIONS[scrollToLevel - 2].x}%`,
              top: `calc(${LEVEL_POSITIONS[scrollToLevel - 2].y}% - 60px)`,
            }}
            animate={{ 
              left: `${LEVEL_POSITIONS[scrollToLevel - 1].x}%`,
              top: `calc(${LEVEL_POSITIONS[scrollToLevel - 1].y}% - 60px)`,
            }}
            transition={{
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.4
            }}
            className="absolute -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-2xl">
              <Image src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" alt="moving" width={64} height={64} className="object-cover" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="sticky bottom-0 z-50 w-full bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200 transition-colors">
                <MapIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Map</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors relative">
                <Calendar className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-white">2</div>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Events</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shop</span>
        </button>
      </div>
    </div>
  );
};

