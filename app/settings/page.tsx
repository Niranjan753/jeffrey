"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Volume2, Music, Bell, Palette, Info } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-xl">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900">Settings</h1>
                  <p className="text-lg text-gray-500 font-medium">Customize your experience</p>
                </div>
              </div>
            </motion.div>

            {/* Audio Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Audio</h2>
              </div>

              <div className="space-y-4">
                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Sound Effects</p>
                      <p className="text-sm text-gray-400">Letter sounds and game effects</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      soundEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                        soundEnabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Background Music Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">Background Music</p>
                      <p className="text-sm text-gray-400">Play music while learning</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      musicEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                        musicEnabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-bold text-gray-900">Daily Reminders</p>
                    <p className="text-sm text-gray-400">Get reminded to practice</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    notificationsEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                      notificationsEnabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Appearance</h2>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="font-bold text-gray-900 mb-2">Theme</p>
                <div className="flex gap-3">
                  <button className="flex-1 p-4 rounded-xl bg-white border-2 border-blue-500 shadow-md">
                    <div className="w-full h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-2" />
                    <p className="text-sm font-bold text-gray-900">Light Mode</p>
                  </button>
                  <button className="flex-1 p-4 rounded-xl bg-gray-100 border-2 border-transparent opacity-50">
                    <div className="w-full h-12 bg-gray-800 rounded-lg mb-2" />
                    <p className="text-sm font-bold text-gray-900">Dark Mode</p>
                    <p className="text-xs text-gray-400">(Coming Soon)</p>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">About</h2>
              </div>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium"><strong className="text-gray-900">Version:</strong> 1.0.0</p>
                <p className="font-medium"><strong className="text-gray-900">Made with:</strong> ❤️ for young learners</p>
                <p className="text-sm text-gray-400 mt-4">© 2025 Word Magic. All rights reserved.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

