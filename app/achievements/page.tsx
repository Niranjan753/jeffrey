"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Trophy, Check, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first level", icon: "🎯", requirement: 1, reward: "50 Coins" },
    { id: 2, title: "Explorer", description: "Complete 3 levels", icon: "🗺️", requirement: 3, reward: "100 Coins" },
    { id: 3, title: "Rising Star", description: "Complete 5 levels", icon: "⭐", requirement: 5, reward: "200 Coins" },
    { id: 4, title: "Word Master", description: "Complete 10 levels", icon: "👑", requirement: 10, reward: "500 Coins" },
    { id: 5, title: "Legend", description: "Complete all levels", icon: "💎", requirement: 10, reward: "1000 Coins" },
  ];

  const badges = [
    { name: "Speed Run", desc: "Complete level under 1 min", icon: "⚡", earned: false },
    { name: "Perfect", desc: "3 stars on 5 levels", icon: "🌟", earned: completedLevels.length >= 5 },
    { name: "Scholar", desc: "Learn 50 words", icon: "📚", earned: completedLevels.length * 5 >= 50 },
    { name: "Streak", desc: "7-day practice streak", icon: "🔥", earned: false },
    { name: "Early Bird", desc: "Practice before 9 AM", icon: "🌅", earned: false },
    { name: "Night Owl", desc: "Practice after 9 PM", icon: "🦉", earned: false },
  ];

  const unlockedCount = achievements.filter(a => completedLevels.length >= a.requirement).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        <div className="h-14 md:hidden flex-shrink-0" />
        
        <div className="flex-grow p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-black">Achievements</h1>
                  <p className="text-gray-500">Track your progress</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-black">{unlockedCount}</div>
                  <div className="text-sm text-gray-500">Unlocked</div>
                </div>
                <div className="border-x border-gray-200">
                  <div className="text-3xl font-bold text-black">{achievements.length}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0a33ff]">{progressPercent}%</div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-black mb-4">Main Achievements</h2>
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const isUnlocked = completedLevels.length >= achievement.requirement;
                  const progress = Math.min((completedLevels.length / achievement.requirement) * 100, 100);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "rounded-xl p-4 border-2 transition-all",
                        isUnlocked ? "border-black bg-gray-50" : "border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
                          isUnlocked ? "bg-black" : "bg-gray-100"
                        )}>
                          {isUnlocked ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            achievement.icon
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-black">{achievement.title}</h3>
                            {isUnlocked && (
                              <span className="text-xs font-semibold text-white bg-black px-2 py-0.5 rounded">UNLOCKED</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{achievement.description}</p>
                          
                          {!isUnlocked && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{completedLevels.length}/{achievement.requirement}</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0a33ff] rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-500 flex-shrink-0">
                          {achievement.reward}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-lg font-bold text-black mb-4">Special Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={cn(
                      "rounded-xl p-4 border-2 text-center transition-all",
                      badge.earned ? "border-black bg-gray-50" : "border-gray-200 opacity-60"
                    )}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold text-black text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                    {badge.earned ? (
                      <div className="mt-2 inline-flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded text-xs font-semibold">
                        <Check className="w-3 h-3" /> Earned
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1 text-gray-400 text-xs">
                        <Lock className="w-3 h-3" /> Locked
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
