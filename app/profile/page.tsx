"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Star, Trophy, Zap, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) {
        setCompletedLevels(JSON.parse(saved));
      }
    }
  }, []);

  const stats = [
    {
      label: "Levels Completed",
      value: completedLevels.length,
      icon: Trophy,
      color: "from-yellow-400 to-orange-500",
    },
    {
      label: "Words Learned",
      value: completedLevels.length * 5,
      icon: Star,
      color: "from-blue-500 to-purple-600",
    },
    {
      label: "Current Streak",
      value: "3 days",
      icon: Zap,
      color: "from-pink-500 to-red-500",
    },
    {
      label: "Total Score",
      value: completedLevels.length * 100,
      icon: TrendingUp,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-2">Profile</h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">Your learning journey</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-6"
            >
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white flex-shrink-0">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>

                {/* User Info */}
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Explorer</h2>
                  <div className="flex flex-col gap-2 text-gray-500">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">guest@wordmagic.com</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Joined December 2025</span>
                    </div>
                  </div>
                </div>

                {/* Level Badge */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg mb-2">
                    <span className="text-3xl font-black text-white">{Math.max(1, Math.floor(completedLevels.length / 2))}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Player Level</span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md mb-2 sm:mb-3`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {completedLevels.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-medium">No activity yet. Start playing to see your progress!</p>
                  </div>
                ) : (
                  completedLevels.slice(0, 5).map((level, index) => (
                    <div
                      key={level}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-gray-900">Completed Level {level}</p>
                        <p className="text-sm text-gray-400">Great job mastering the words!</p>
                      </div>
                      <span className="text-xs font-bold text-gray-400">Recently</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

