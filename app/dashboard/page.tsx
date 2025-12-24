"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { LevelMap } from "@/components/LevelMap";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, Gem, Coins, Flame, Clock, Sparkles, Star } from "lucide-react";
import { MusicControl } from "@/components/MusicControl";
import { playLevelWinSound } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import {
  loadEngagementState,
  saveEngagementState,
  completeWord,
  completeLevel,
  loseLife,
  getTimeUntilNextLife,
  formatTimeRemaining,
  getRandomCelebration,
  buyLivesWithGems,
  EngagementState,
} from "@/lib/engagement";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "level_complete" | "animating_to_next" | "no_lives">("menu");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [shouldScrollToLevel, setShouldScrollToLevel] = useState<number | null>(null);
  const [engagement, setEngagement] = useState<EngagementState | null>(null);
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<{ text: string; emoji: string; color: string } | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [perfectLevel, setPerfectLevel] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
      setEngagement(loadEngagementState());
    }
  }, []);

  // Timer for life regeneration
  useEffect(() => {
    if (!engagement) return;
    
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
      
      // Reload state to get regenerated lives
      const newState = loadEngagementState();
      if (newState.lives !== engagement.lives) {
        setEngagement(newState);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [engagement]);

  const handleSelectLevel = (level: number) => {
    if (!engagement) return;
    
    // Check if player has lives
    if (engagement.lives <= 0) {
      setGameState("no_lives");
      return;
    }
    
    setCurrentLevel(level);
    setCurrentWordIndex(0);
    setPerfectLevel(true); // Track if level is completed without mistakes
    setGameState("playing");
  };

  const handleWordComplete = () => {
    if (!engagement) return;
    
    // Update engagement state
    const newState = completeWord(engagement);
    setEngagement(newState);
    saveEngagementState(newState);
    
    setCurrentWordIndex((prev) => prev + 1);
  };

  const handleWordIndexChange = (newIndex: number) => {
    setCurrentWordIndex(newIndex);
  };

  const handleMistake = () => {
    // Track that this level wasn't perfect
    setPerfectLevel(false);
  };

  const handleLevelComplete = () => {
    if (!engagement) return;
    
    const newCompleted = [...new Set([...completedLevels, currentLevel])];
    setCompletedLevels(newCompleted);
    localStorage.setItem("word-game-progress", JSON.stringify(newCompleted));
    
    // Update engagement with level completion
    const newState = completeLevel(engagement, perfectLevel);
    setEngagement(newState);
    saveEngagementState(newState);
    
    // Calculate coins earned this level
    const earned = perfectLevel ? 100 : 50;
    setCoinsEarned(earned);
    
    // Get random celebration (variable rewards)
    setCelebration(getRandomCelebration());
    
    playLevelWinSound();
    
    // Celebration confetti with random colors (variable reward)
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981"],
    });
    
    // Go back to map and start animations
    setGameState("animating_to_next");
    
    // Trigger scroll and avatar animation to next level
    setTimeout(() => {
      setShouldScrollToLevel(currentLevel + 1);
    }, 400);
    
    // Clear scroll trigger after animation completes
    setTimeout(() => {
      setShouldScrollToLevel(null);
    }, 2200);
    
    // Show completion overlay AFTER map animation is done
    setTimeout(() => {
      setGameState("level_complete");
    }, 2500);
  };

  const handleGiveUp = () => {
    if (!engagement) return;
    
    // Lose a life when giving up
    const newState = loseLife(engagement);
    setEngagement(newState);
    saveEngagementState(newState);
    
    if (newState.lives <= 0) {
      setGameState("no_lives");
    } else {
      goBackToMenu();
    }
  };

  const handleBuyLives = () => {
    if (!engagement) return;
    
    const newState = buyLivesWithGems(engagement);
    if (newState) {
      setEngagement(newState);
      saveEngagementState(newState);
      setGameState("menu");
    }
  };

  const goBackToMenu = () => {
    setGameState("menu");
    // Scroll to current level when returning to menu
    setTimeout(() => {
      setShouldScrollToLevel(Math.max(1, ...completedLevels) + 1);
      setTimeout(() => setShouldScrollToLevel(null), 1000);
    }, 100);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-hidden">
        <MusicControl />
        
        {/* Lives & Resources Bar - Fixed at top during gameplay */}
        {gameState === "playing" && engagement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center justify-between shadow-sm"
          >
            <button
              onClick={handleGiveUp}
              className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="font-black text-pink-600 text-sm">{engagement.lives}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-black text-yellow-600 text-sm">{engagement.coins}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-black text-orange-600 text-sm">{engagement.currentStreak}</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="flex-grow w-full overflow-y-auto overflow-x-hidden pt-16 md:pt-0 scroll-smooth">
          <AnimatePresence mode="wait">
            {(gameState === "menu" || gameState === "animating_to_next") && (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <LevelMap
                  completedLevels={completedLevels}
                  onSelectLevel={handleSelectLevel}
                  scrollToLevel={shouldScrollToLevel}
                  engagement={engagement}
                />
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative h-full w-full pt-14"
              >
                <GameBoard
                  key={`${currentLevel}-${currentWordIndex}`}
                  level={currentLevel}
                  wordIndex={currentWordIndex}
                  onWordComplete={handleWordComplete}
                  onLevelComplete={handleLevelComplete}
                  onWordIndexChange={handleWordIndexChange}
                  onMistake={handleMistake}
                  engagement={engagement}
                />
              </motion.div>
            )}

            {gameState === "level_complete" && celebration && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 md:absolute flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 z-[100] p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-[100px] md:text-[140px] mb-2"
                    >
                      {celebration.emoji}
                    </motion.div>
                    <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10" />
                  </div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${celebration.color} mb-2 uppercase`}
                  >
                    {celebration.text}
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl font-bold text-gray-600 mb-4"
                  >
                    You mastered Level {currentLevel}!
                  </motion.p>

                  {/* Rewards earned */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-4 mb-2"
                  >
                    <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-2xl shadow-lg">
                      <Coins className="w-6 h-6 text-yellow-500" />
                      <span className="font-black text-yellow-600 text-xl">+{coinsEarned}</span>
                    </div>
                    {perfectLevel && (
                      <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-2xl shadow-lg">
                        <Gem className="w-6 h-6 text-purple-500" />
                        <span className="font-black text-purple-600 text-xl">+1</span>
                      </div>
                    )}
                    {perfectLevel && (
                      <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-2xl shadow-lg">
                        <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                        <span className="font-black text-amber-600 text-sm">PERFECT!</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Streak reminder - FOMO */}
                  {engagement && engagement.currentStreak > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full"
                    >
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-orange-600">{engagement.currentStreak} day streak! Keep it going! 🔥</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectLevel(currentLevel + 1)}
                    className="px-12 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl text-2xl font-black hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-300/50 border-b-4 border-blue-800"
                  >
                    NEXT LEVEL
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goBackToMenu}
                    className="px-10 py-5 bg-white text-gray-600 rounded-3xl text-xl font-black hover:bg-gray-50 transition-all shadow-xl border-b-4 border-gray-300"
                  >
                    MENU
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* No Lives Modal - Time Gate */}
            {gameState === "no_lives" && engagement && (
              <motion.div
                key="no-lives"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-xl"
                  >
                    <Heart className="w-12 h-12 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-black text-gray-900 mb-2">Out of Lives!</h2>
                  <p className="text-gray-600 mb-2">Your lives will regenerate over time.</p>
                  
                  {timeUntilLife && (
                    <div className="flex items-center justify-center gap-2 text-pink-600 mb-6">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold">Next life in {formatTimeRemaining(timeUntilLife)}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyLives}
                      disabled={engagement.gems < 3}
                      className={`w-full py-4 rounded-2xl text-lg font-black transition-all flex items-center justify-center gap-2 ${
                        engagement.gems >= 3
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-xl"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Gem className="w-5 h-5" />
                      Refill Lives (3 Gems)
                      <span className="text-sm opacity-80">({engagement.gems} available)</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goBackToMenu}
                      className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl text-lg font-bold hover:bg-gray-200 transition-all"
                    >
                      Wait for Lives
                    </motion.button>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    💡 Tip: Claim your daily reward for free lives!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
