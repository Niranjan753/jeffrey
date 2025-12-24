"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Lock, Check, Play, Coins, Flame, Star, Trophy, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GAME_ZONES, GameZone, ZoneLevel } from "@/data/levels";
import { 
  EngagementState, 
  saveEngagementState, 
  isDailyRewardAvailable,
  formatTimeRemaining,
  getCurrentEvent,
  spendCoins,
  LEVEL_COSTS,
  canAffordLevel,
} from "@/lib/engagement";

interface GameZoneMapProps {
  engagement: EngagementState | null;
  onSelectLevel: (zone: GameZone, level: ZoneLevel) => void;
  onEngagementUpdate: (state: EngagementState) => void;
  onBuyCoins: () => void;
}

const getUnlockedZones = (): string[] => {
  if (typeof window === "undefined") return ["spell-meadow"];
  const saved = localStorage.getItem("word-game-unlocked-zones");
  return saved ? JSON.parse(saved) : ["spell-meadow", "scramble-canyon"]; // Free zones
};

const saveUnlockedZones = (zones: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("word-game-unlocked-zones", JSON.stringify(zones));
};

const getZoneProgress = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("word-game-zone-progress");
  return saved ? JSON.parse(saved) : {};
};

export function GameZoneMap({ engagement, onSelectLevel, onEngagementUpdate, onBuyCoins }: GameZoneMapProps) {
  const [selectedZone, setSelectedZone] = useState<GameZone | null>(null);
  const [unlockedZones, setUnlockedZones] = useState<string[]>(["spell-meadow", "scramble-canyon"]);
  const [zoneProgress, setZoneProgress] = useState<Record<string, string[]>>({});
  const [showUnlockModal, setShowUnlockModal] = useState<GameZone | null>(null);

  useEffect(() => {
    setUnlockedZones(getUnlockedZones());
    setZoneProgress(getZoneProgress());
  }, []);

  const handleUnlockZone = (zone: GameZone) => {
    if (!engagement) return;
    
    const cost = zone.unlockCost;
    const newState = spendCoins(engagement, cost);
    
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

  const getZoneCompletedCount = (zone: GameZone): number => {
    return zoneProgress[zone.id]?.length || 0;
  };

  const isLevelCompleted = (zone: GameZone, level: ZoneLevel): boolean => {
    return zoneProgress[zone.id]?.includes(level.id) || false;
  };

  const canPlayLevel = (level: ZoneLevel): boolean => {
    if (!engagement) return false;
    return canAffordLevel(engagement, level.difficulty || "easy");
  };

  const event = engagement ? getCurrentEvent(engagement) : null;
  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;

  return (
    <div className="w-full min-h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">Word Games</h1>
          
          {/* Stats */}
          {engagement && (
            <div className="flex items-center gap-2">
              <button
                onClick={onBuyCoins}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Coins className="w-4 h-4 text-black" />
                <span className="font-semibold text-black text-sm">{engagement.coins}</span>
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
              {engagement.currentStreak > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold text-sm">{engagement.currentStreak}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Daily Reward Banner */}
      {canClaimDaily && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-4 pt-4 max-w-4xl mx-auto"
        >
          <a href="/rewards" className="block">
            <div className="bg-[#0a33ff] text-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">Daily Reward Ready!</p>
                <p className="text-sm text-white/80">Tap to claim your coins</p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
        </motion.div>
      )}

      {/* Event Banner */}
      {event && (
        <div className="px-4 pt-4 max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{event.emoji}</span>
              <div>
                <p className="font-bold text-black">{event.name}</p>
                <p className="text-sm text-gray-500">{event.progress}/{event.target} • {formatTimeRemaining(event.timeRemaining)}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Trophy className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedZone ? (
          /* Zone Selection */
          <motion.div
            key="zones"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 max-w-4xl mx-auto"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {GAME_ZONES.map((zone: GameZone, index: number) => {
                const isUnlocked = unlockedZones.includes(zone.id);
                const completedCount = getZoneCompletedCount(zone);
                const unlockCost = zone.unlockCost;
                
                return (
                  <motion.button
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleZoneClick(zone)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      isUnlocked
                        ? "bg-white border-gray-200 hover:border-black"
                        : "bg-gray-50 border-gray-100 opacity-75 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{zone.emoji}</span>
                        <div>
                          <h3 className="font-bold text-black">{zone.name}</h3>
                          <p className="text-xs text-gray-500">{zone.description}</p>
                        </div>
                      </div>
                      
                      {!isUnlocked && unlockCost > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                          <Coins className="w-3 h-3 text-black" />
                          <span className="text-xs font-semibold text-black">{unlockCost}</span>
                        </div>
                      )}
                    </div>
                    
                    {isUnlocked ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black transition-all"
                              style={{ width: `${(completedCount / zone.levels.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{completedCount}/{zone.levels.length}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Tap to unlock</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Level Selection */
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            {/* Zone Header */}
            <div className="sticky top-[57px] z-20 bg-white border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 text-gray-600" />
                </button>
                <span className="text-2xl">{selectedZone.emoji}</span>
                <div>
                  <h2 className="font-bold text-black">{selectedZone.name}</h2>
                  <p className="text-xs text-gray-500">{getZoneCompletedCount(selectedZone)}/{selectedZone.levels.length} completed</p>
                </div>
              </div>
            </div>
            
            {/* Levels Grid */}
            <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {selectedZone.levels.map((level, index) => {
                const isCompleted = isLevelCompleted(selectedZone, level);
                const cost = LEVEL_COSTS[level.difficulty || "easy"];
                const canPlay = canPlayLevel(level);
                
                return (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onSelectLevel(selectedZone, level)}
                    disabled={!canPlay}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      isCompleted
                        ? "bg-gray-50 border-gray-200"
                        : canPlay
                        ? "bg-white border-gray-200 hover:border-[#0a33ff]"
                        : "bg-gray-50 border-gray-100 opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            canPlay ? "bg-[#0a33ff]" : "bg-gray-200"
                          )}>
                            <span className="text-white font-bold text-sm">{level.levelNum}</span>
                          </div>
                        )}
                        <span className="font-bold text-black">Level {level.levelNum}</span>
                      </div>
                      
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        level.difficulty === "hard" ? "bg-gray-100 text-gray-600" :
                        level.difficulty === "medium" ? "bg-gray-100 text-gray-600" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        <Coins className="w-3 h-3" />
                        {cost}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {level.words?.length || level.scrambleWords?.length || level.crossword?.length || level.searchData?.words.length || level.matchPairs?.length || 0} items • {level.difficulty || "easy"}
                    </p>
                    
                    {isCompleted && (
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3].map((star) => (
                          <Star key={star} className="w-3 h-3 text-black fill-black" />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock Zone Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowUnlockModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <span className="text-5xl mb-4 block">{showUnlockModal.emoji}</span>
                <h3 className="text-xl font-bold text-black mb-2">{showUnlockModal.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{showUnlockModal.description}</p>
                
                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-gray-100 rounded-xl">
                  <Coins className="w-5 h-5 text-black" />
                  <span className="text-xl font-bold text-black">
                    {showUnlockModal.unlockCost}
                  </span>
                  <span className="text-gray-500">coins to unlock</span>
                </div>
                
                {engagement && (
                  <p className="text-sm text-gray-500 mb-6">
                    You have: <span className="font-semibold text-black">{engagement.coins}</span> coins
                  </p>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnlockModal(null)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {engagement && engagement.coins >= showUnlockModal.unlockCost ? (
                    <button
                      onClick={() => handleUnlockZone(showUnlockModal)}
                      className="flex-1 py-3 bg-[#0a33ff] text-white rounded-xl font-semibold hover:bg-[#0829cc] transition-colors"
                    >
                      Unlock
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUnlockModal(null);
                        onBuyCoins();
                      }}
                      className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Buy Coins
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
