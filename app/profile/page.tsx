"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { User, Trophy, Star, Crown, Medal, TrendingUp, Target, Zap, Users, Award } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "leaderboard">("stats");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    }
  }, []);

  const totalWords = completedLevels.length * 5;
  const totalScore = completedLevels.length * 100;
  const playerLevel = Math.max(1, Math.floor(completedLevels.length / 2) + 1);

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: "WordMaster", level: 15, score: 2500, avatar: "seed1", isCurrentUser: false },
    { rank: 2, name: "SpellWizard", level: 12, score: 2100, avatar: "seed2", isCurrentUser: false },
    { rank: 3, name: "You", level: playerLevel, score: totalScore, avatar: "avatar", isCurrentUser: true },
    { rank: 4, name: "LetterLegend", level: 8, score: 1800, avatar: "seed3", isCurrentUser: false },
    { rank: 5, name: "VocabKing", level: 7, score: 1600, avatar: "seed4", isCurrentUser: false },
  ];

  const achievements = [
    { title: "First Steps", desc: "Complete Level 1", icon: "🎯", unlocked: completedLevels.length >= 1 },
    { title: "Word Explorer", desc: "Complete 3 Levels", icon: "🗺️", unlocked: completedLevels.length >= 3 },
    { title: "Speed Reader", desc: "Complete 5 Levels", icon: "⚡", unlocked: completedLevels.length >= 5 },
    { title: "Master Player", desc: "Reach Level 10", icon: "👑", unlocked: completedLevels.length >= 10 },
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
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-yellow-400/30 mb-6 overflow-hidden relative"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl -z-0" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                  {/* Avatar with Frame */}
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-yellow-400 shadow-2xl bg-white">
                      <Image 
                        src="https://api.dicebear.com/7.x/adventurer/svg?seed=avatar" 
                        alt="profile" 
                        width={128} 
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 border-4 border-white flex items-center justify-center shadow-lg">
                      <span className="text-xl">⭐</span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-grow text-center md:text-left">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Word Explorer</h1>
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3">
                      <div className="flex items-center gap-2 bg-yellow-100 px-4 py-1.5 rounded-full">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-black text-yellow-700">Level {playerLevel}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 px-4 py-1.5 rounded-full">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-black text-blue-700">{totalScore} Points</span>
                      </div>
                    </div>
                    {/* Progress to next level */}
                    <div className="max-w-md">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                        <span>Progress to Level {playerLevel + 1}</span>
                        <span>{completedLevels.length % 2}/2 Levels</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${((completedLevels.length % 2) / 2) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-white mb-2 relative">
                      <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                        <span className="text-2xl font-black bg-gradient-to-br from-orange-500 to-yellow-500 bg-clip-text text-transparent">#3</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-gray-600 uppercase">Global Rank</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex-1 py-3 px-6 rounded-2xl font-black text-lg transition-all ${
                  activeTab === "stats"
                    ? "bg-white text-purple-600 shadow-lg border-2 border-purple-200"
                    : "bg-white/60 text-gray-400 hover:bg-white/80"
                }`}
              >
                📊 Stats
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`flex-1 py-3 px-6 rounded-2xl font-black text-lg transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-white text-purple-600 shadow-lg border-2 border-purple-200"
                    : "bg-white/60 text-gray-400 hover:bg-white/80"
                }`}
              >
                🏆 Leaderboard
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Levels", value: completedLevels.length, icon: Target, color: "from-blue-500 to-blue-600" },
                    { label: "Words", value: totalWords, icon: Star, color: "from-purple-500 to-purple-600" },
                    { label: "Streak", value: "3🔥", icon: Zap, color: "from-orange-500 to-red-500" },
                    { label: "Score", value: totalScore, icon: Trophy, color: "from-yellow-500 to-orange-500" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Achievements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-7 h-7 text-purple-600" />
                    <h3 className="text-2xl font-black text-gray-900">Achievements</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{achievement.icon}</div>
                          <div className="flex-grow">
                            <h4 className="font-black text-gray-900 mb-1">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.desc}</p>
                          </div>
                          {achievement.unlocked && (
                            <div className="text-green-500 flex-shrink-0">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "leaderboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-7 h-7 text-yellow-600" />
                  <h3 className="text-2xl font-black text-gray-900">Global Leaderboard</h3>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((player, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        player.isCurrentUser
                          ? "bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg"
                          : "bg-gray-50 border-2 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${
                        player.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md" :
                        player.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md" :
                        player.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md" :
                        "bg-white text-gray-600"
                      }`}>
                        {player.rank === 1 ? "👑" : player.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                        <Image 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${player.avatar}`} 
                          alt={player.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-grow">
                        <h4 className="font-black text-gray-900">{player.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">Level {player.level}</p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-xl font-black text-purple-600">{player.score}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Challenge Friends Button */}
                <button className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all border-b-4 border-purple-700 active:border-b-2">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Challenge Friends</span>
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
