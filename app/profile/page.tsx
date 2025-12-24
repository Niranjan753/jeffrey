"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { User, Trophy, Flame, Clock, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [totalPlayTime, setTotalPlayTime] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("word-game-progress");
      if (saved) setCompletedLevels(JSON.parse(saved));
      
      const playTime = localStorage.getItem("word-game-playtime");
      if (playTime) setTotalPlayTime(parseInt(playTime));
    }
  }, []);

  const formatPlayTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    { label: "Levels", value: completedLevels.length, icon: Trophy },
    { label: "Streak", value: 7, icon: Flame },
    { label: "Time", value: formatPlayTime(totalPlayTime || 45), icon: Clock },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        <div className="h-14 md:hidden flex-shrink-0" />
        
        <div className="flex-grow p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100">
                  <Image
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
                    alt="Profile"
                    width={96}
                    height={96}
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                  <Edit2 size={14} />
                </button>
              </div>
              <h1 className="text-2xl font-bold text-black">Word Explorer</h1>
              <p className="text-gray-500 text-sm">Level 3 • Learning Expert</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200"
                >
                  <stat.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-black">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
              <h2 className="font-bold text-black mb-4">Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall</span>
                    <span className="font-semibold text-black">{Math.round((completedLevels.length / 10) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0a33ff] rounded-full transition-all" 
                      style={{ width: `${(completedLevels.length / 10) * 100}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Words Learned</span>
                    <span className="font-semibold text-black">{completedLevels.length * 5}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black rounded-full transition-all" 
                      style={{ width: `${Math.min((completedLevels.length * 5 / 50) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="font-bold text-black mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {completedLevels.slice(-3).reverse().map((level, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold">
                        {level}
                      </div>
                      <div>
                        <div className="font-medium text-black">Level {level}</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                ))}
                {completedLevels.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
