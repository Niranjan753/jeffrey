"use client";

import { GAME_ZONES, GameZone, ZoneLevel } from "@/data/levels";
import { cn } from "@/lib/utils";
import { 
  saveEngagementState, 
  spendGems, 
  isDailyRewardAvailable,
  formatTimeRemaining,
  getCurrentEvent,
  LEVEL_COSTS,
  canAffordLevel,
  EngagementState 
} from "@/lib/engagement";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Gem, Coins, Gift, Flame, Clock, ChevronRight, ChevronLeft, Zap, Play, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

interface GameZoneMapProps {
  engagement: EngagementState | null;
  onSelectLevel: (zone: GameZone, level: ZoneLevel) => void;
  onEngagementUpdate: (state: EngagementState) => void;
  onBuyCoins?: () => void;
}

const getZoneProgress = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("word-game-zone-progress");
  return saved ? JSON.parse(saved) : {};
};

const getUnlockedZones = (): string[] => {
  if (typeof window === "undefined") return ["spell-meadow", "scramble-canyon"];
  const saved = localStorage.getItem("word-game-unlocked-zones");
  const freeZones = GAME_ZONES.filter(z => z.unlockCost === 0).map(z => z.id);
  const savedZones = saved ? JSON.parse(saved) : [];
  return [...new Set([...freeZones, ...savedZones])];
};

const saveUnlockedZones = (zones: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("word-game-unlocked-zones", JSON.stringify(zones));
};

export function GameZoneMap({ engagement, onSelectLevel, onEngagementUpdate, onBuyCoins }: GameZoneMapProps) {
  const [selectedZone, setSelectedZone] = useState<GameZone | null>(null);
  const [zoneProgress, setZoneProgress] = useState<Record<string, string[]>>({});
  const [unlockedZones, setUnlockedZones] = useState<string[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState<GameZone | null>(null);

  useEffect(() => {
    setZoneProgress(getZoneProgress());
    setUnlockedZones(getUnlockedZones());
  }, []);

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
    <div className="relative w-full h-full min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Coins with Buy Button */}
          <button 
            onClick={onBuyCoins}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <Coins className="w-4 h-4 text-black" />
            <span className="font-semibold text-black text-sm">{engagement?.coins?.toLocaleString() ?? 500}</span>
            <Plus className="w-3 h-3 text-gray-400 group-hover:text-[#0a33ff] transition-colors" />
          </button>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200">
            <Gem className="w-4 h-4 text-[#0a33ff]" />
            <span className="font-semibold text-black text-sm">{engagement?.gems ?? 10}</span>
          </div>

          {/* Streak */}
          {engagement && engagement.currentStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white">
              <Flame className="w-4 h-4" />
              <span className="font-semibold text-sm">{engagement.currentStreak}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {canClaimDaily && (
            <Link href="/rewards">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-9 h-9 rounded-full bg-[#0a33ff] flex items-center justify-center cursor-pointer"
              >
                <Gift className="w-4 h-4 text-white" />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-black rounded-full border-2 border-white" />
              </motion.div>
            </Link>
          )}
          <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=avatar" alt="profile" width={36} height={36} />
          </div>
        </div>
      </div>

      {/* Event Banner */}
      {currentEvent && (
        <div className="mx-4 mt-4 rounded-xl bg-black text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{currentEvent.emoji}</span>
            <div>
              <span className="font-semibold text-sm">{currentEvent.name}</span>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatTimeRemaining(currentEvent.timeRemaining)}</span>
              </div>
            </div>
          </div>
          <span className="font-bold">{currentEvent.progress}/{currentEvent.target}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto px-4 md:px-6 py-6">
        <AnimatePresence mode="wait">
          {!selectedZone ? (
            <motion.div
              key="zones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-1">Games</h1>
                <p className="text-gray-500 mb-8">Choose a game mode</p>

                <div className="space-y-3">
                  {GAME_ZONES.map((zone, index) => {
                    const isUnlocked = unlockedZones.includes(zone.id);
                    const completed = getZoneCompletedLevels(zone.id);
                    const total = zone.levels.length;
                    const progress = (completed / total) * 100;

                    return (
                      <motion.button
                        key={zone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleZoneClick(zone)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all border",
                          isUnlocked
                            ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            : "bg-gray-50 border-gray-100 opacity-70"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                          isUnlocked ? "bg-gray-100" : "bg-gray-200"
                        )}>
                          {zone.emoji}
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-black truncate">{zone.name}</h3>
                            {!isUnlocked && (
                              <div className="flex items-center gap-1 text-xs text-[#0a33ff] font-medium">
                                <Gem className="w-3 h-3" />
                                {zone.unlockCost}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{zone.description}</p>
                          
                          {isUnlocked && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-black rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400 font-medium">{completed}/{total}</span>
                            </div>
                          )}
                        </div>

                        {isUnlocked ? (
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="levels"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-3xl mx-auto">
                {/* Back & Header */}
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-black" />
                  </button>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    {selectedZone.emoji}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-black">{selectedZone.name}</h2>
                    <p className="text-sm text-gray-500">{selectedZone.description}</p>
                  </div>
                </div>

                {/* Levels */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedZone.levels.map((level, index) => {
                    const isLevelDone = zoneProgress[selectedZone.id]?.includes(level.id);
                    const isAccessible = isLevelUnlocked(selectedZone, index);
                    const isCurrent = isAccessible && !isLevelDone;
                    const cost = LEVEL_COSTS[level.difficulty || "easy"];
                    const canAfford = engagement ? canAffordLevel(engagement, level.difficulty || "easy") : false;

                    return (
                      <motion.button
                        key={level.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => isAccessible && onSelectLevel(selectedZone, level)}
                        disabled={!isAccessible}
                        className={cn(
                          "relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border",
                          isLevelDone
                            ? "bg-black text-white border-black"
                            : isCurrent
                              ? canAfford
                                ? "bg-[#0a33ff] text-white border-[#0a33ff] shadow-lg"
                                : "bg-gray-100 text-gray-400 border-gray-200"
                              : isAccessible
                                ? "bg-white text-black border-gray-200 hover:border-gray-300"
                                : "bg-gray-50 text-gray-300 border-gray-100"
                        )}
                      >
                        <span className="text-2xl font-bold">{level.levelNum}</span>
                        
                        {isLevelDone ? (
                          <span className="text-xs mt-1">✓</span>
                        ) : isAccessible ? (
                          <div className="flex items-center gap-0.5 mt-1">
                            <Coins className="w-3 h-3" />
                            <span className="text-xs font-medium">{cost}</span>
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 mt-1" />
                        )}
                        
                        {isCurrent && canAfford && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                          >
                            <Play className="w-2.5 h-2.5 text-[#0a33ff] fill-[#0a33ff]" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Level Cost Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Easy: {LEVEL_COSTS.easy} coins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Medium: {LEVEL_COSTS.medium} coins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Hard: {LEVEL_COSTS.hard} coins</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-50 w-full bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-8">
        <button 
          onClick={() => setSelectedZone(null)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            !selectedZone ? "text-[#0a33ff]" : "text-gray-400"
          )}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide">Play</span>
        </button>
        
        <Link href="/rewards" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors relative">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
            <Gift className="w-5 h-5" />
            {canClaimDaily && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#0a33ff] rounded-full" />
            )}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide">Rewards</span>
        </Link>
        
        <button 
          onClick={onBuyCoins}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide">Shop</span>
        </button>
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                {showUnlockModal.emoji}
              </div>

              <h2 className="text-xl font-bold text-center text-black mb-1">
                Unlock {showUnlockModal.name}
              </h2>
              <p className="text-gray-500 text-center text-sm mb-6">
                {showUnlockModal.description}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6 bg-gray-50 p-4 rounded-xl">
                <Gem className="w-5 h-5 text-[#0a33ff]" />
                <span className="text-2xl font-bold text-black">{showUnlockModal.unlockCost}</span>
                <span className="text-gray-500">gems</span>
              </div>

              <p className="text-center text-sm text-gray-400 mb-4">
                You have <span className="font-semibold text-black">{engagement?.gems ?? 0}</span> gems
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnlockModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnlockZone(showUnlockModal)}
                  disabled={!engagement || engagement.gems < showUnlockModal.unlockCost}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                    engagement && engagement.gems >= showUnlockModal.unlockCost
                      ? "bg-[#0a33ff] text-white hover:bg-[#0829cc]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Gem className="w-4 h-4" />
                  Unlock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
