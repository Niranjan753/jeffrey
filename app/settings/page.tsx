"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Volume2, Music, Bell, Palette, Globe, Trash2, HelpCircle, Shield, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = {
        sound: localStorage.getItem("sound-enabled"),
        music: localStorage.getItem("music-enabled"),
        notifications: localStorage.getItem("notifications-enabled"),
        vibration: localStorage.getItem("vibration-enabled"),
      };

      if (savedSettings.sound !== null) setSoundEnabled(savedSettings.sound === "true");
      if (savedSettings.music !== null) setMusicEnabled(savedSettings.music === "true");
      if (savedSettings.notifications !== null) setNotificationsEnabled(savedSettings.notifications === "true");
      if (savedSettings.vibration !== null) setVibrationEnabled(savedSettings.vibration === "true");
    }
  }, []);

  // Save setting to localStorage
  const saveSetting = (key: string, value: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value.toString());
    }
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    saveSetting("sound-enabled", newValue);
  };

  const handleMusicToggle = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    saveSetting("music-enabled", newValue);
  };

  const handleNotificationsToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    saveSetting("notifications-enabled", newValue);
  };

  const handleVibrationToggle = () => {
    const newValue = !vibrationEnabled;
    setVibrationEnabled(newValue);
    saveSetting("vibration-enabled", newValue);
  };

  const handleResetProgress = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("word-game-progress");
      setShowResetConfirm(false);
      window.location.reload();
    }
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-16 h-9 rounded-full transition-all shadow-inner ${
        enabled ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all ${
          enabled ? "right-1" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="flex h-screen bg-[#fdf5cc] overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-4 sm:p-6 md:p-8">
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
                  <p className="text-lg text-gray-600 font-medium">Customize your experience</p>
                </div>
              </div>
            </motion.div>

            {/* Audio Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Audio</h2>
              </div>

              <div className="space-y-4">
                {/* Sound Effects */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Sound Effects</p>
                      <p className="text-sm text-gray-500 font-medium">Game sounds and letter effects</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={soundEnabled} onToggle={handleSoundToggle} />
                </div>

                {/* Background Music */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Music className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Background Music</p>
                      <p className="text-sm text-gray-500 font-medium">Play music while learning</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={musicEnabled} onToggle={handleMusicToggle} />
                </div>
              </div>
            </motion.div>

            {/* Game Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-md">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Game Settings</h2>
              </div>

              <div className="space-y-4">
                {/* Notifications */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Notifications</p>
                      <p className="text-sm text-gray-500 font-medium">Daily reminders to practice</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={notificationsEnabled} onToggle={handleNotificationsToggle} />
                </div>

                {/* Vibration */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">Haptic Feedback</p>
                      <p className="text-sm text-gray-500 font-medium">Vibration on interactions</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={vibrationEnabled} onToggle={handleVibrationToggle} />
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Appearance</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-yellow-400 shadow-md">
                  <div className="w-full h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl mb-3 flex items-center justify-center">
                    <span className="text-2xl">☀️</span>
                  </div>
                  <p className="text-sm font-black text-gray-900 text-center">Light Mode</p>
                  <p className="text-xs text-green-600 font-bold text-center mt-1">✓ Active</p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-100 border-2 border-gray-200 opacity-50">
                  <div className="w-full h-16 bg-gray-800 rounded-xl mb-3 flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <p className="text-sm font-black text-gray-900 text-center">Dark Mode</p>
                  <p className="text-xs text-gray-400 font-bold text-center mt-1">Coming Soon</p>
                </div>
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Data Management</h2>
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-5 rounded-2xl bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-black text-red-700 text-lg">Reset Progress</p>
                    <p className="text-sm text-red-600 font-medium">Delete all game data and start fresh</p>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Support & Info</h2>
              </div>

              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-900">Help Center</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button className="w-full p-4 rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-900">Privacy Policy</span>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <div className="pt-4 border-t-2 border-gray-100">
                  <p className="text-sm text-gray-500 font-medium"><strong className="text-gray-900">Version:</strong> 1.0.0</p>
                  <p className="text-xs text-gray-400 mt-2">© 2025 Word Magic. Made with ❤️ for young learners.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Reset Progress?</h3>
              <p className="text-gray-600 font-medium">This will delete all your game progress, levels, and achievements. This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-black hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Reset All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
