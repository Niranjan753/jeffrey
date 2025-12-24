"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { GameZoneMap } from "@/components/GameZoneMap";
import { ScrambleGame, CrosswordGame, WordSearchGame, MatchGame } from "@/components/games";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, Gem, Coins, Flame, Clock } from "lucide-react";
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
  buyLivesWithGems,
  EngagementState,
} from "@/lib/engagement";
import confetti from "canvas-confetti";

type GameState = "menu" | "playing" | "level_complete" | "no_lives";

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
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [perfectLevel, setPerfectLevel] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEngagement(loadEngagementState());
    }
  }, []);

  useEffect(() => {
    if (!engagement) return;
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
      const newState = loadEngagementState();
      if (newState.lives !== engagement.lives) {
        setEngagement(newState);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [engagement]);

  const handleSelectLevel = (zone: GameZone, level: ZoneLevel) => {
    if (!engagement) return;
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
    setCoinsEarned(perfect ? 100 : 50);
    playLevelWinSound();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });
    setGameState("level_complete");
  };

  const handleGiveUp = () => {
    if (!engagement) return;
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
        
        {/* Top Bar during gameplay */}
        {gameState === "playing" && engagement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between"
          >
            <button
              onClick={handleGiveUp}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200">
                <Heart className="w-4 h-4 text-black fill-black" />
                <span className="font-semibold text-black text-sm">{engagement.lives}</span>
              </div>
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
            
            {currentZone && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentZone.emoji}</span>
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
                  <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl text-white">✓</span>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-black mb-2">
                    Level {currentLevel?.levelNum} Complete
                  </h2>
                  
                  <div className="flex items-center justify-center gap-4 mt-6 mb-8">
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                      <Coins className="w-5 h-5 text-black" />
                      <span className="font-bold text-black">+{coinsEarned}</span>
                    </div>
                    {perfectLevel && (
                      <div className="flex items-center gap-2 bg-[#0a33ff] text-white px-4 py-2 rounded-xl">
                        <Gem className="w-5 h-5" />
                        <span className="font-bold">+1</span>
                      </div>
                    )}
                  </div>

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
                      className="px-8 py-4 bg-[#0a33ff] text-white rounded-xl font-semibold hover:bg-[#0829cc] transition-colors"
                    >
                      Next Level
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={goBackToMenu}
                      className="px-8 py-4 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Menu
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {gameState === "no_lives" && engagement && (
              <motion.div
                key="no-lives"
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
                    <Heart className="w-8 h-8 text-black" />
                  </div>

                  <h2 className="text-2xl font-bold text-center text-black mb-2">Out of Lives</h2>
                  <p className="text-gray-500 text-center mb-2">Lives regenerate over time</p>
                  
                  {timeUntilLife && (
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Next in {formatTimeRemaining(timeUntilLife)}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={handleBuyLives}
                      disabled={engagement.gems < 3}
                      className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                        engagement.gems >= 3
                          ? "bg-[#0a33ff] text-white hover:bg-[#0829cc]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Gem className="w-4 h-4" />
                      Refill Lives (3 Gems)
                    </button>

                    <button
                      onClick={goBackToMenu}
                      className="w-full py-3 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Wait
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
