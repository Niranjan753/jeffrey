"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/GameBoard";
import { LevelMap } from "@/components/LevelMap";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { MusicControl } from "@/components/MusicControl";
import { playLevelWinSound } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

export default function Dashboard() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "level_complete" | "animating_to_next">("menu");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [shouldScrollToLevel, setShouldScrollToLevel] = useState<number | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    }
  }, []);

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setCurrentWordIndex(0);
    setGameState("playing");
  };

  const handleWordComplete = () => {
    setCurrentWordIndex((prev) => prev + 1);
  };

  const handleWordIndexChange = (newIndex: number) => {
    setCurrentWordIndex(newIndex);
  };

  const handleLevelComplete = () => {
    const newCompleted = [...new Set([...completedLevels, currentLevel])];
    setCompletedLevels(newCompleted);
    localStorage.setItem("word-game-progress", JSON.stringify(newCompleted));
    playLevelWinSound();
    
    // First, go back to map with fade transition
    setGameState("animating_to_next");
    
    // Trigger scroll animation to next level
    setTimeout(() => {
      setShouldScrollToLevel(currentLevel + 1);
    }, 600);
    
    // Show completion overlay after scroll animation completes
    setTimeout(() => {
      setGameState("level_complete");
      setShouldScrollToLevel(null);
    }, 3200);
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
                />
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative h-full w-full"
              >
                <button
                  onClick={goBackToMenu}
                  className="fixed top-3 md:top-6 left-2 md:left-6 p-2 md:p-3 rounded-full bg-white/95 backdrop-blur-md text-gray-400 hover:text-gray-600 transition-all z-[70] shadow-md border border-gray-200 active:scale-95 touch-manipulation"
                >
                  <ChevronLeft size={18} className="md:w-7 md:h-7" />
                </button>
                <GameBoard
                  key={`${currentLevel}-${currentWordIndex}`}
                  level={currentLevel}
                  wordIndex={currentWordIndex}
                  onWordComplete={handleWordComplete}
                  onLevelComplete={handleLevelComplete}
                  onWordIndexChange={handleWordIndexChange}
                />
              </motion.div>
            )}

            {gameState === "level_complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 md:absolute flex flex-col items-center justify-center bg-white/95 backdrop-blur-md z-[100] p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="mb-8"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-[120px] mb-4"
                    >
                      🏆
                    </motion.div>
                    <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10" />
                  </div>
                  <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 drop-shadow-sm uppercase">
                    FANTASTIC!
                  </h2>
                  <p className="text-2xl font-bold text-gray-400">You mastered Level {currentLevel}!</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goBackToMenu}
                    className="px-10 py-5 bg-gray-100 text-gray-500 rounded-3xl text-2xl font-black hover:bg-gray-200 transition-all shadow-xl border-b-4 border-gray-300"
                  >
                    MENU
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectLevel(currentLevel + 1)}
                    className="px-12 py-5 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-3xl text-2xl font-black hover:from-blue-500 hover:to-blue-700 transition-all shadow-xl shadow-blue-200 border-b-4 border-blue-800"
                  >
                    NEXT LEVEL
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
