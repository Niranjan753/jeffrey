"use client";

import { GAME_ZONES, GameZone, ZoneLevel } from "@/data/levels";
import { cn } from "@/lib/utils";
import { 
  loadEngagementState, 
  saveEngagementState, 
  spendGems, 
  isDailyRewardAvailable,
  formatTimeRemaining,
  getTimeUntilNextLife,
  getCurrentEvent,
  EngagementState 
} from "@/lib/engagement";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Lock, Gem, Coins, Gift, Settings, Flame, Clock, Sparkles, ChevronRight, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface GameZoneMapProps {
  engagement: EngagementState | null;
  onSelectLevel: (zone: GameZone, level: ZoneLevel) => void;
  onEngagementUpdate: (state: EngagementState) => void;
}

// Progress storage helpers
const getZoneProgress = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("word-game-zone-progress");
  return saved ? JSON.parse(saved) : {};
};

const saveZoneProgress = (progress: Record<string, string[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("word-game-zone-progress", JSON.stringify(progress));
};

const getUnlockedZones = (): string[] => {
  if (typeof window === "undefined") return ["spell-meadow", "scramble-canyon"];
  const saved = localStorage.getItem("word-game-unlocked-zones");
  // Free zones are always unlocked
  const freeZones = GAME_ZONES.filter(z => z.unlockCost === 0).map(z => z.id);
  const savedZones = saved ? JSON.parse(saved) : [];
  return [...new Set([...freeZones, ...savedZones])];
};

const saveUnlockedZones = (zones: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("word-game-unlocked-zones", JSON.stringify(zones));
};

export function GameZoneMap({ engagement, onSelectLevel, onEngagementUpdate }: GameZoneMapProps) {
  const [selectedZone, setSelectedZone] = useState<GameZone | null>(null);
  const [zoneProgress, setZoneProgress] = useState<Record<string, string[]>>({});
  const [unlockedZones, setUnlockedZones] = useState<string[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState<GameZone | null>(null);
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoneProgress(getZoneProgress());
    setUnlockedZones(getUnlockedZones());
  }, []);

  // Timer for life regeneration display
  useEffect(() => {
    if (!engagement) return;
    
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [engagement]);

  const handleUnlockZone = (zone: GameZone) => {
    if (!engagement) return;
    
    const newState = spendGems(engagement, zone.unlockCost);
    if (newState) {
      const newUnlocked = [...unlockedZones, zone.id];
      setUnlockedZones(newUnlocked);
      saveUnlockedZones(newUnlocked);
      onEngagementUpdate(newState);
      saveEngagementState(newState);
      setShowUnlockModal(null);
      setSelectedZone(zone);
    }
  };

  const handleZoneClick = (zone: GameZone) => {
    if (unlockedZones.includes(zone.id)) {
      setSelectedZone(zone);
    } else {
      setShowUnlockModal(zone);
    }
  };

  const getZoneCompletedLevels = (zoneId: string): number => {
    return zoneProgress[zoneId]?.length || 0;
  };

  const isLevelUnlocked = (zone: GameZone, levelIndex: number): boolean => {
    if (levelIndex === 0) return true;
    const completed = zoneProgress[zone.id] || [];
    const prevLevel = zone.levels[levelIndex - 1];
    return completed.includes(prevLevel.id);
  };

  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;
  const currentEvent = engagement ? getCurrentEvent(engagement) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 overflow-hidden flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top Bar */}
      <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Lives */}
          <div className="flex items-center gap-1 md:gap-2 bg-pink-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-pink-100 shadow-sm">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="font-black text-pink-600 text-xs md:text-sm">{engagement?.lives ?? 5}</span>
            {timeUntilLife && engagement && engagement.lives < engagement.maxLives && (
              <span className="hidden md:inline text-[10px] text-pink-400">
                +1 in {formatTimeRemaining(timeUntilLife)}
              </span>
            )}
          </div>
          
          {/* Coins */}
          <div className="flex items-center gap-1 md:gap-2 bg-yellow-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-yellow-100 shadow-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-black text-yellow-600 text-xs md:text-sm">{engagement?.coins?.toLocaleString() ?? 100}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 md:gap-2 bg-purple-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-purple-100 shadow-sm">
            <Gem className="w-4 h-4 text-purple-500" />
            <span className="font-black text-purple-600 text-xs md:text-sm">{engagement?.gems ?? 5}</span>
          </div>

          {/* Streak */}
          {engagement && engagement.currentStreak > 0 && (
            <motion.div 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-orange-100 to-red-100 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-orange-200 shadow-sm"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-black text-orange-600 text-xs md:text-sm">{engagement.currentStreak}</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Daily Reward */}
          {canClaimDaily && (
            <Link href="/rewards">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg cursor-pointer"
              >
                <Gift className="w-4 h-4 md:w-5 md:h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full flex items-center justify-center text-[6px] md:text-[8px] text-white font-black border-2 border-white animate-pulse">
                  !
                </div>
              </motion.div>
            </Link>
          )}

          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-blue-400 overflow-hidden bg-white shadow-sm">
            <Image src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" alt="profile" width={40} height={40} />
          </div>
        </div>
      </div>

      {/* Limited-Time Event Banner */}
      {currentEvent && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-40 mx-3 mt-3 rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <div className="relative px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentEvent.emoji}</span>
              <div>
                <span className="text-white font-black text-xs md:text-sm">{currentEvent.name}</span>
                <div className="flex items-center gap-1 text-white/80 text-[10px]">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeRemaining(currentEvent.timeRemaining)}</span>
                </div>
              </div>
            </div>
            <div className="text-white font-black text-sm">{currentEvent.progress}/{currentEvent.target}</div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto px-3 md:px-6 py-4 md:py-6">
        <AnimatePresence mode="wait">
          {!selectedZone ? (
            // Zone Selection View
            <motion.div
              key="zones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 text-center">
                🎮 Game Zones
              </h1>
              <p className="text-gray-500 font-medium text-center mb-6 text-sm md:text-base">
                Choose your adventure!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {GAME_ZONES.map((zone, index) => {
                  const isUnlocked = unlockedZones.includes(zone.id);
                  const completed = getZoneCompletedLevels(zone.id);
                  const total = zone.levels.length;
                  const progress = (completed / total) * 100;

                  return (
                    <motion.button
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleZoneClick(zone)}
                      className={cn(
                        "relative rounded-2xl md:rounded-3xl p-4 md:p-6 text-left transition-all overflow-hidden group",
                        isUnlocked
                          ? "bg-white shadow-xl hover:shadow-2xl hover:scale-[1.02] border-2 border-gray-100"
                          : "bg-gray-100 border-2 border-gray-200"
                      )}
                    >
                      {/* Background gradient */}
                      <div className={cn(
                        "absolute inset-0 opacity-10 bg-gradient-to-br",
                        zone.bgGradient
                      )} />

                      {/* Lock overlay */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <div className="bg-white/90 rounded-2xl p-3 shadow-lg text-center">
                            <Lock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <div className="flex items-center gap-1 text-sm font-bold text-purple-600">
                              <Gem className="w-4 h-4" />
                              {zone.unlockCost}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative z-0">
                        {/* Zone Icon & Name */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg bg-gradient-to-br",
                            zone.bgGradient
                          )}>
                            {zone.emoji}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-black text-gray-900">{zone.name}</h3>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">{zone.description}</p>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{completed}/{total} levels</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={cn("h-full bg-gradient-to-r", zone.bgGradient)}
                            />
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-4 h-4",
                                progress >= s * 33 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              )}
                            />
                          ))}
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            // Level Selection View
            <motion.div
              key="levels"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Back Button & Zone Header */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br",
                  selectedZone.bgGradient
                )}>
                  {selectedZone.emoji}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900">{selectedZone.name}</h2>
                  <p className="text-sm text-gray-500 font-medium">{selectedZone.description}</p>
                </div>
              </div>

              {/* Levels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {selectedZone.levels.map((level, index) => {
                  const isLevelDone = zoneProgress[selectedZone.id]?.includes(level.id);
                  const isAccessible = isLevelUnlocked(selectedZone, index);
                  const isCurrent = isAccessible && !isLevelDone;

                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => isAccessible && onSelectLevel(selectedZone, level)}
                      disabled={!isAccessible}
                      className={cn(
                        "relative rounded-2xl p-4 md:p-5 transition-all",
                        isLevelDone
                          ? "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-lg"
                          : isCurrent
                            ? `bg-gradient-to-br ${selectedZone.bgGradient} text-white shadow-xl hover:shadow-2xl hover:scale-105`
                            : !isAccessible
                              ? "bg-gray-100 border-2 border-gray-200 opacity-60"
                              : "bg-white border-2 border-gray-200 shadow-md hover:shadow-lg hover:scale-105"
                      )}
                    >
                      {/* Level Number */}
                      <div className={cn(
                        "text-2xl md:text-3xl font-black mb-2",
                        isLevelDone ? "text-green-600" : isCurrent ? "text-white" : "text-gray-400"
                      )}>
                        {level.levelNum}
                      </div>

                      {/* Status */}
                      {isLevelDone ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map(s => (
                            <Star key={s} className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      ) : !isAccessible ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          level.difficulty === "easy" ? "bg-green-100 text-green-700" :
                          level.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {level.difficulty.toUpperCase()}
                        </span>
                      )}

                      {/* Current Level Indicator */}
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Zap className="w-4 h-4 text-yellow-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-50 w-full bg-white border-t border-gray-100 px-4 py-2 md:py-3 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setSelectedZone(null)}
          className="flex flex-col items-center gap-0.5 group"
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            !selectedZone ? "bg-orange-100 text-orange-500" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
          )}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-wide",
            !selectedZone ? "text-orange-500" : "text-gray-400"
          )}>Zones</span>
        </button>
        
        <Link href="/rewards" className="flex flex-col items-center gap-0.5 group relative">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
            <Gift className="w-5 h-5" />
            {canClaimDaily && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-black border-2 border-white animate-pulse">
                !
              </div>
            )}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide group-hover:text-gray-600">Rewards</span>
        </Link>
        
        <Link href="/achievements" className="flex flex-col items-center gap-0.5 group">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
            <Star className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide group-hover:text-gray-600">Achieve</span>
        </Link>
      </div>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowUnlockModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className={cn(
                "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl shadow-xl bg-gradient-to-br",
                showUnlockModal.bgGradient
              )}>
                {showUnlockModal.emoji}
              </div>

              <h2 className="text-2xl font-black text-center text-gray-900 mb-2">
                Unlock {showUnlockModal.name}?
              </h2>
              <p className="text-gray-500 text-center mb-6">
                {showUnlockModal.description}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 bg-purple-50 p-3 rounded-xl">
                <Gem className="w-6 h-6 text-purple-500" />
                <span className="text-2xl font-black text-purple-600">{showUnlockModal.unlockCost}</span>
                <span className="text-gray-500 font-bold">gems required</span>
              </div>

              <div className="text-center text-sm text-gray-500 mb-4">
                You have: <span className="font-bold text-purple-600">{engagement?.gems ?? 0}</span> gems
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnlockModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnlockZone(showUnlockModal)}
                  disabled={!engagement || engagement.gems < showUnlockModal.unlockCost}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                    engagement && engagement.gems >= showUnlockModal.unlockCost
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Gem className="w-4 h-4" />
                  Unlock
                </button>
              </div>

              {engagement && engagement.gems < showUnlockModal.unlockCost && (
                <p className="text-center text-xs text-red-500 mt-3">
                  Not enough gems! Keep playing to earn more.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

