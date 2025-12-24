"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameZoneMap } from "@/components/GameZoneMap";
import { ScrambleGame, CrosswordGame, WordSearchGame, MatchGame } from "@/components/games";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, Gem, Coins, Flame, Clock, Sparkles, Star } from "lucide-react";
import { MusicControl } from "@/components/MusicControl";
import { playLevelWinSound } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { GameZone, ZoneLevel } from "@/data/levels";
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

type GameState = "menu" | "playing" | "level_complete" | "no_lives";

// Progress helpers
const getZoneProgress = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem("word-game-zone-progress");
  return saved ? JSON.parse(saved) : {};
};

const saveZoneProgress = (progress: Record<string, string[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("word-game-zone-progress", JSON.stringify(progress));
};

export default function Dashboard() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentZone, setCurrentZone] = useState<GameZone | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ZoneLevel | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [engagement, setEngagement] = useState<EngagementState | null>(null);
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<{ text: string; emoji: string; color: string } | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [perfectLevel, setPerfectLevel] = useState(false);

  // Load engagement state
  useEffect(() => {
    if (typeof window !== "undefined") {
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

  const handleSelectLevel = (zone: GameZone, level: ZoneLevel) => {
    if (!engagement) return;
    
    // Check if player has lives
    if (engagement.lives <= 0) {
      setGameState("no_lives");
      return;
    }
    
    setCurrentZone(zone);
    setCurrentLevel(level);
    setCurrentWordIndex(0);
    setPerfectLevel(true);
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

  const handleMistake = () => {
    setPerfectLevel(false);
  };

  const handleLevelComplete = (perfect: boolean = perfectLevel) => {
    if (!engagement || !currentZone || !currentLevel) return;
    
    // Save progress
    const progress = getZoneProgress();
    if (!progress[currentZone.id]) {
      progress[currentZone.id] = [];
    }
    if (!progress[currentZone.id].includes(currentLevel.id)) {
      progress[currentZone.id].push(currentLevel.id);
      saveZoneProgress(progress);
    }
    
    // Update engagement with level completion
    const newState = completeLevel(engagement, perfect);
    setEngagement(newState);
    saveEngagementState(newState);
    
    // Calculate coins earned
    const earned = perfect ? 100 : 50;
    setCoinsEarned(earned);
    
    // Get random celebration
    setCelebration(getRandomCelebration());
    
    playLevelWinSound();
    
    // Celebration confetti
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981"],
    });
    
    setGameState("level_complete");
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
    setCurrentZone(null);
    setCurrentLevel(null);
  };

  const handlePlayNextLevel = () => {
    if (!currentZone || !currentLevel) return;
    
    // Find next level
    const currentIndex = currentZone.levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex < currentZone.levels.length - 1) {
      handleSelectLevel(currentZone, currentZone.levels[currentIndex + 1]);
    } else {
      goBackToMenu();
    }
  };

  const renderGame = () => {
    if (!currentZone || !currentLevel) return null;

    switch (currentZone.gameType) {
      case "spell":
        if (!currentLevel.words) return null;
        return (
          <GameBoard
            key={`${currentLevel.id}-${currentWordIndex}`}
            level={currentZone.levels.indexOf(currentLevel) + 1}
            wordIndex={currentWordIndex}
            onWordComplete={handleWordComplete}
            onLevelComplete={() => handleLevelComplete()}
            onWordIndexChange={setCurrentWordIndex}
            onMistake={handleMistake}
            engagement={engagement}
            customWords={currentLevel.words}
          />
        );

      case "scramble":
        if (!currentLevel.scrambleWords) return null;
        return (
          <ScrambleGame
            words={currentLevel.scrambleWords}
            timeLimit={currentLevel.timeLimit || 60}
            onComplete={handleLevelComplete}
            onWordComplete={handleWordComplete}
          />
        );

      case "crossword":
        if (!currentLevel.crossword) return null;
        return (
          <CrosswordGame
            clues={currentLevel.crossword}
            gridSize={currentLevel.gridSize || 6}
            onComplete={handleLevelComplete}
          />
        );

      case "search":
        if (!currentLevel.searchData) return null;
        return (
          <WordSearchGame
            data={currentLevel.searchData}
            onComplete={handleLevelComplete}
          />
        );

      case "match":
        if (!currentLevel.matchPairs) return null;
        return (
          <MatchGame
            pairs={currentLevel.matchPairs}
            onComplete={handleLevelComplete}
          />
        );

      default:
        return null;
    }
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
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 bg-pink-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-pink-100">
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-500 fill-pink-500" />
                <span className="font-black text-pink-600 text-xs md:text-sm">{engagement.lives}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-yellow-100">
                <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                <span className="font-black text-yellow-600 text-xs md:text-sm">{engagement.coins}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-orange-100">
                <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                <span className="font-black text-orange-600 text-xs md:text-sm">{engagement.currentStreak}</span>
              </div>
            </div>
            
            {currentZone && (
              <div className="flex items-center gap-2 bg-gray-100 px-2 md:px-3 py-1 rounded-full">
                <span className="text-lg">{currentZone.emoji}</span>
                <span className="hidden md:inline font-bold text-gray-600 text-sm">{currentZone.name}</span>
              </div>
            )}
          </motion.div>
        )}
        
        <div className="flex-grow w-full overflow-y-auto overflow-x-hidden pt-16 md:pt-0 scroll-smooth">
          <AnimatePresence mode="wait">
            {gameState === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <GameZoneMap
                  engagement={engagement}
                  onSelectLevel={handleSelectLevel}
                  onEngagementUpdate={setEngagement}
                />
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative h-full w-full pt-12 md:pt-14"
              >
                {renderGame()}
              </motion.div>
            )}

            {gameState === "level_complete" && celebration && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 md:absolute flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 z-[100] p-6 md:p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                  className="mb-4 md:mb-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-[80px] md:text-[120px] mb-2"
                    >
                      {celebration.emoji}
                    </motion.div>
                    <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10" />
                  </div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${celebration.color} mb-2 uppercase`}
                  >
                    {celebration.text}
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-2xl font-bold text-gray-600 mb-4"
                  >
                    Level {currentLevel?.levelNum} Complete!
                  </motion.p>

                  {/* Rewards earned */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-3 md:gap-4 mb-2 flex-wrap"
                  >
                    <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-2xl shadow-lg">
                      <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                      <span className="font-black text-yellow-600 text-lg md:text-xl">+{coinsEarned}</span>
                    </div>
                    {perfectLevel && (
                      <>
                        <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-2xl shadow-lg">
                          <Gem className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                          <span className="font-black text-purple-600 text-lg md:text-xl">+1</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 px-3 md:px-4 py-2 rounded-2xl shadow-lg">
                          <Star className="w-5 h-5 md:w-6 md:h-6 text-amber-500 fill-amber-500" />
                          <span className="font-black text-amber-600 text-sm">PERFECT!</span>
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Streak reminder */}
                  {engagement && engagement.currentStreak > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full"
                    >
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-orange-600">{engagement.currentStreak} day streak! 🔥</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3 md:gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayNextLevel}
                    className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl md:rounded-3xl text-xl md:text-2xl font-black hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-300/50 border-b-4 border-blue-800"
                  >
                    NEXT LEVEL
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goBackToMenu}
                    className="px-8 md:px-10 py-4 md:py-5 bg-white text-gray-600 rounded-2xl md:rounded-3xl text-lg md:text-xl font-black hover:bg-gray-50 transition-all shadow-xl border-b-4 border-gray-300"
                  >
                    MENU
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* No Lives Modal */}
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
                  className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-3xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-xl"
                  >
                    <Heart className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Out of Lives!</h2>
                  <p className="text-gray-600 mb-2">Your lives will regenerate over time.</p>
                  
                  {timeUntilLife && (
                    <div className="flex items-center justify-center gap-2 text-pink-600 mb-4 md:mb-6">
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
                      className={`w-full py-3 md:py-4 rounded-2xl text-base md:text-lg font-black transition-all flex items-center justify-center gap-2 ${
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
                      className="w-full py-3 md:py-4 bg-gray-100 text-gray-600 rounded-2xl text-base md:text-lg font-bold hover:bg-gray-200 transition-all"
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

