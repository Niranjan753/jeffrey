"use client";

import { LEVELS } from "@/data/levels";
import { cn } from "@/lib/utils";
import { 
  getCurrentEvent, 
  isDailyRewardAvailable, 
  formatTimeRemaining, 
  getTimeUntilNextLife,
  EngagementState 
} from "@/lib/engagement";
import { motion } from "framer-motion";
import { Star, Heart, Trophy, Gift, Calendar, Map as MapIcon, Settings, Flame, Clock, Coins, Gem, Zap, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface LevelMapProps {
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
  scrollToLevel?: number | null;
  engagement?: EngagementState | null;
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

export const LevelMap = ({ completedLevels, onSelectLevel, scrollToLevel, engagement }: LevelMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const levelRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);

  // Timer for life regeneration display
  useEffect(() => {
    if (!engagement) return;
    
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [engagement]);

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

  const currentEvent = engagement ? getCurrentEvent(engagement) : null;
  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[1400px] bg-[#fdf5cc] overflow-hidden flex flex-col">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Top Bar with Engagement Stats */}
      <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          {/* Lives */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-pink-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-pink-100 shadow-sm">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500 fill-pink-500" />
            <span className="font-black text-pink-600 text-sm md:text-base">{engagement?.lives ?? 5}</span>
            {timeUntilLife && engagement && engagement.lives < engagement.maxLives && (
              <div className="hidden md:flex items-center gap-1 text-xs text-pink-400">
                <Clock className="w-3 h-3" />
                {formatTimeRemaining(timeUntilLife)}
              </div>
            )}
          </div>
          
          {/* Coins */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-yellow-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-yellow-100 shadow-sm">
            <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className="font-black text-yellow-600 text-sm md:text-base">{engagement?.coins?.toLocaleString() ?? 100}</span>
          </div>

          {/* Gems */}
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-purple-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-purple-100 shadow-sm">
            <Gem className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
            <span className="font-black text-purple-600 text-sm md:text-base">{engagement?.gems ?? 5}</span>
          </div>

          {/* Streak - FOMO element */}
          {engagement && engagement.currentStreak > 0 && (
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-orange-200 shadow-sm"
            >
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              <span className="font-black text-orange-600 text-sm md:text-base">{engagement.currentStreak}</span>
              <span className="hidden md:inline text-xs font-bold text-orange-400">day streak!</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Daily Reward Indicator - FOMO */}
          {canClaimDaily && (
            <Link href="/rewards">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              >
                <Gift className="w-5 h-5 md:w-6 md:h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px] text-white font-black border-2 border-white animate-pulse">
                  !
                </div>
              </motion.div>
            </Link>
          )}

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-blue-400 overflow-hidden bg-white shadow-sm">
            <Image src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" alt="profile" width={40} height={40} />
          </div>
          <Link href="/settings">
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <Settings className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
            </button>
          </Link>
        </div>
      </div>

      {/* Limited-Time Event Banner - Maximum FOMO */}
      {currentEvent && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-40 mx-4 mt-4 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <div className="relative px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentEvent.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm md:text-base">{currentEvent.name}</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIMITED TIME
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Ends in {formatTimeRemaining(currentEvent.timeRemaining)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-black">{currentEvent.progress}/{currentEvent.target}</div>
              <Link href="/rewards" className="text-white/80 text-xs hover:text-white flex items-center gap-1">
                View <Sparkles className="w-3 h-3" />
              </Link>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(currentEvent.progress / currentEvent.target) * 100}%` }}
              className="h-full bg-white"
            />
          </div>
        </motion.div>
      )}

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

                  {/* Pulse effect for current level */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-pink-400 rounded-full"
                    />
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

                {/* "Play!" tooltip for current level */}
                {isCurrent && !scrollToLevel && (
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -bottom-8 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg"
                  >
                    PLAY!
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
      <div className="sticky bottom-0 z-50 w-full bg-white border-t border-gray-100 px-4 md:px-8 py-3 md:py-4 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200 transition-colors">
            <MapIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Map</span>
        </button>
        
        <Link href="/rewards" className="flex flex-col items-center gap-1 group relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors relative">
            <Gift className="w-5 h-5 md:w-6 md:h-6" />
            {canClaimDaily && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px] text-white font-black border-2 border-white"
              >
                !
              </motion.div>
            )}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Rewards</span>
        </Link>
        
        <Link href="/achievements" className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
            <Trophy className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600">Trophies</span>
        </Link>
      </div>
    </div>
  );
};
