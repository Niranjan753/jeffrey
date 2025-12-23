"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Trophy, Star, Medal, Award, Target, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  unlocked: boolean;
  progress?: number;
  total?: number;
  unlockedDate?: string;
}

export default function AchievementsPage() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    }
  }, []);

  const achievements: Achievement[] = [
    {
      id: "first-word",
      title: "First Steps",
      description: "Complete your first word",
      icon: Star,
      unlocked: completedLevels.length > 0,
      unlockedDate: completedLevels.length > 0 ? "Recently" : undefined,
    },
    {
      id: "level-master-1",
      title: "Level Master",
      description: "Complete Level 1",
      icon: Trophy,
      unlocked: completedLevels.includes(1),
      unlockedDate: completedLevels.includes(1) ? "Recently" : undefined,
    },
    {
      id: "level-master-3",
      title: "Rising Star",
      description: "Complete 3 levels",
      icon: Medal,
      unlocked: completedLevels.length >= 3,
      progress: Math.min(completedLevels.length, 3),
      total: 3,
    },
    {
      id: "level-master-5",
      title: "Word Wizard",
      description: "Complete 5 levels",
      icon: Award,
      unlocked: completedLevels.length >= 5,
      progress: Math.min(completedLevels.length, 5),
      total: 5,
    },
    {
      id: "perfect-level",
      title: "Perfect Score",
      description: "Complete a level without mistakes",
      icon: Target,
      unlocked: false,
      progress: 0,
      total: 1,
    },
    {
      id: "speed-demon",
      title: "Speed Demon",
      description: "Complete a word in under 10 seconds",
      icon: Zap,
      unlocked: false,
      progress: 0,
      total: 1,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900">Achievements</h1>
                  <p className="text-lg text-gray-500 font-medium">Track your amazing progress!</p>
                </div>
              </div>
              
              {/* Progress Summary */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {unlockedCount}/{achievements.length}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-3xl p-6 shadow-lg border-2 transition-all ${
                    achievement.unlocked
                      ? "border-green-200 hover:shadow-xl hover:scale-[1.02]"
                      : "border-gray-100 opacity-75"
                  }`}
                >
                  {/* Lock/Unlock Indicator */}
                  {achievement.unlocked && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-blue-500 to-purple-600"
                        : "bg-gray-200"
                    }`}>
                      <achievement.icon className={`w-7 h-7 ${
                        achievement.unlocked ? "text-white" : "text-gray-400"
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className={`text-xl font-black mb-1 ${
                        achievement.unlocked ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {achievement.description}
                      </p>

                      {/* Progress Bar (if applicable) */}
                      {achievement.total && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-400">
                              {achievement.progress}/{achievement.total}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${((achievement.progress || 0) / achievement.total) * 100}%` }}
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Unlock Date */}
                      {achievement.unlockedDate && (
                        <span className="text-xs text-green-600 font-bold">
                          Unlocked {achievement.unlockedDate}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

