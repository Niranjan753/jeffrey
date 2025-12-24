"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameZoneMap } from "@/components/GameZoneMap";
import { ScrambleGame, CrosswordGame, WordSearchGame, MatchGame } from "@/components/games";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Coins, Flame, Plus, X } from "lucide-react";
import { MusicControl } from "@/components/MusicControl";
import { playLevelWinSound } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { GameZone, ZoneLevel } from "@/data/levels";
import {  
  loadEngagementState,
  saveEngagementState,
  completeWord,
  completeLevel,
  spendCoinsForLevel,
  canAffordLevel,
  LEVEL_COSTS,
  COIN_PACKAGES,
  EngagementState,
} from "@/lib/engagement";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

type GameState = "menu" | "playing" | "level_complete" | "no_coins";

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
  const [perfectLevel, setPerfectLevel] = useState(false);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEngagement(loadEngagementState());
    }
  }, []);

  const handleSelectLevel = (zone: GameZone, level: ZoneLevel) => {
    if (!engagement) return;
    
    const difficulty = level.difficulty || "easy";
    
    // Check if player can afford to play
    if (!canAffordLevel(engagement, difficulty)) {
      setGameState("no_coins");
      return;
    }
    
    // Spend coins to play
    const newState = spendCoinsForLevel(engagement, difficulty);
    if (!newState) {
      setGameState("no_coins");
      return;
    }
    
    setEngagement(newState);
    saveEngagementState(newState);
    setCurrentZone(zone);
    setCurrentLevel(level);
    setCurrentWordIndex(0);
    setPerfectLevel(true);
    setGameState("playing");
  };

  const handleWordComplete = () => {
    if (!engagement) return;
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
    
    const progress = getZoneProgress();
    if (!progress[currentZone.id]) progress[currentZone.id] = [];
    if (!progress[currentZone.id].includes(currentLevel.id)) {
      progress[currentZone.id].push(currentLevel.id);
      saveZoneProgress(progress);
    }
    
    const newState = completeLevel(engagement, perfect);
    setEngagement(newState);
    saveEngagementState(newState);
    playLevelWinSound();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });
    setGameState("level_complete");
  };

  const handleGiveUp = () => {
    goBackToMenu();
  };

  const handleRestartLevel = () => {
    if (!currentZone || !currentLevel) return;
    // Reset state and restart the same level (don't charge coins again)
    setCurrentWordIndex(0);
    setPerfectLevel(true);
    // Increment restart key to force component remount
    setRestartKey(prev => prev + 1);
  };

  const goBackToMenu = () => {
    setGameState("menu");
    setCurrentZone(null);
    setCurrentLevel(null);
  };

  const handlePlayNextLevel = () => {
    if (!currentZone || !currentLevel || !engagement) return;
    const currentIndex = currentZone.levels.findIndex(l => l.id === currentLevel.id);
    if (currentIndex < currentZone.levels.length - 1) {
      const nextLevel = currentZone.levels[currentIndex + 1];
      const difficulty = nextLevel.difficulty || "easy";
      
      if (!canAffordLevel(engagement, difficulty)) {
        setGameState("no_coins");
        return;
      }
      
      handleSelectLevel(currentZone, nextLevel);
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
            key={`${currentLevel.id}-scramble-${restartKey}`}
            words={currentLevel.scrambleWords}
            timeLimit={currentLevel.timeLimit || 60}
            onComplete={handleLevelComplete}
            onWordComplete={handleWordComplete}
            onRestart={handleRestartLevel}
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
        
        {/* Top Bar during gameplay */}
        {gameState === "playing" && engagement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between"
          >
            <button
              onClick={handleGiveUp}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200">
                <Coins className="w-4 h-4 text-black" />
                <span className="font-semibold text-black text-sm">{engagement.coins}</span>
              </div>
              {engagement.currentStreak > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold text-sm">{engagement.currentStreak}</span>
                </div>
              )}
            </div>
            
            {currentZone && currentLevel && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{currentZone.emoji}</span>
                <span className="hidden md:inline">-{LEVEL_COSTS[currentLevel.difficulty || "easy"]} coins</span>
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
                  onBuyCoins={() => setShowBuyCoins(true)}
                />
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full pt-12"
              >
                {renderGame()}
              </motion.div>
            )}

            {gameState === "level_complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[100] p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-white">✓</span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-black mb-2">
                    Level Complete!
                  </h2>
                  
                  <p className="text-gray-500 mb-8">
                    {currentZone?.name} - Level {currentLevel?.levelNum}
                  </p>

                  {engagement && engagement.currentStreak > 0 && (
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-8">
                      <Flame className="w-4 h-4 text-black" />
                      <span className="font-medium text-black">{engagement.currentStreak} day streak</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlayNextLevel}
                      className="px-8 py-4 bg-[#0a33ff] text-white rounded-xl font-semibold hover:bg-[#0829cc] transition-colors cursor-pointer"
                    >
                      Next Level
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={goBackToMenu}
                      className="px-8 py-4 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Menu
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* No Coins Modal */}
            {gameState === "no_coins" && engagement && (
              <motion.div
                key="no-coins"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-black" />
                  </div>

                  <h2 className="text-2xl font-bold text-center text-black mb-2">Not Enough Coins</h2>
                  <p className="text-gray-500 text-center mb-6">
                    You need more coins to play this level
                  </p>

                  <div className="text-center text-sm text-gray-500 mb-6">
                    Current balance: <span className="font-semibold text-black">{engagement.coins}</span> coins
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setGameState("menu");
                        setShowBuyCoins(true);
                      }}
                      className="w-full py-3 rounded-xl font-semibold bg-[#0a33ff] text-white hover:bg-[#0829cc] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Buy Coins
                    </button>

                    <button
                      onClick={goBackToMenu}
                      className="w-full py-3 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Go Back
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-4 text-center">
                    💡 Tip: Complete daily challenges for free coins!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Buy Coins Modal */}
      <AnimatePresence>
        {showBuyCoins && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowBuyCoins(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Buy Coins</h2>
                <button
                  onClick={() => setShowBuyCoins(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                {COIN_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all hover:border-gray-300 cursor-pointer",
                      pkg.popular ? "border-[#0a33ff] bg-blue-50/30" : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-black" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-black">{pkg.coins.toLocaleString()} Coins</div>
                        {pkg.popular && (
                          <span className="text-xs font-semibold text-[#0a33ff]">BEST VALUE</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black">{pkg.price}</div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-6">
                Purchases will be available soon
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
