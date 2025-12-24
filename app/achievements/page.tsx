"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Zap, Crown, Award, Medal, Gem } from "lucide-react";
import { useState, useEffect } from "react";

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
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first level",
      icon: "🎯",
      requirement: 1,
      reward: "50 Points",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Word Explorer",
      description: "Complete 3 levels",
      icon: "🗺️",
      requirement: 3,
      reward: "100 Points",
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Rising Star",
      description: "Complete 5 levels",
      icon: "⭐",
      requirement: 5,
      reward: "200 Points",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: 4,
      title: "Master Player",
      description: "Complete 10 levels",
      icon: "👑",
      requirement: 10,
      reward: "500 Points",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 5,
      title: "Legend",
      description: "Complete all levels",
      icon: "💎",
      requirement: 10,
      reward: "1000 Points",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  const badges = [
    { name: "Speed Demon", desc: "Complete a level in under 1 minute", icon: "⚡", earned: false },
    { name: "Perfect Score", desc: "Get 3 stars on 5 levels", icon: "🌟", earned: completedLevels.length >= 5 },
    { name: "Word Wizard", desc: "Learn 50 new words", icon: "🧙", earned: completedLevels.length * 5 >= 50 },
    { name: "Streak Master", desc: "7-day practice streak", icon: "🔥", earned: false },
    { name: "Early Bird", desc: "Practice before 9 AM", icon: "🌅", earned: false },
    { name: "Night Owl", desc: "Practice after 9 PM", icon: "🦉", earned: false },
  ];

  return (
    <div className="flex h-screen bg-[#fdf5cc] overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-4 sm:p-6 md:p-8">
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
                  <p className="text-lg text-gray-600 font-medium">Track your milestones</p>
                </div>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-yellow-400/30 mb-8"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-purple-600 mb-1">
                    {achievements.filter(a => completedLevels.length >= a.requirement).length}
                  </div>
                  <div className="text-sm font-bold text-gray-500">Unlocked</div>
                </div>
                <div className="text-center border-x-2 border-gray-100">
                  <div className="text-4xl font-black text-orange-600 mb-1">{achievements.length}</div>
                  <div className="text-sm font-bold text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-green-600 mb-1">
                    {Math.round((achievements.filter(a => completedLevels.length >= a.requirement).length / achievements.length) * 100)}%
                  </div>
                  <div className="text-sm font-bold text-gray-500">Progress</div>
                </div>
              </div>
            </motion.div>

            {/* Main Achievements */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-600" />
                Main Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const isUnlocked = completedLevels.length >= achievement.requirement;
                  const progress = Math.min((completedLevels.length / achievement.requirement) * 100, 100);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative rounded-3xl p-6 border-3 transition-all ${
                        isUnlocked
                          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-xl"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {isUnlocked && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">✓</span>
                        </div>
                      )}

                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-black text-gray-900 mb-1">{achievement.title}</h3>
                          <p className="text-sm text-gray-600 font-medium mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Gem className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-bold text-purple-600">{achievement.reward}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {!isUnlocked && (
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{completedLevels.length}/{achievement.requirement}</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full bg-gradient-to-r ${achievement.color} rounded-full`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Medal className="w-6 h-6 text-blue-600" />
                Special Badges
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      badge.earned
                        ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-lg"
                        : "bg-white border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h4 className="font-black text-gray-900 mb-1">{badge.name}</h4>
                      <p className="text-xs text-gray-600 font-medium">{badge.desc}</p>
                      {badge.earned && (
                        <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          <span>✓</span> Earned
                        </div>
                      )}
                    </div>
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
