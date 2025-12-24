"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Volume2, Bell, Globe, Shield, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("English");

  const toggleSettings = [
    { 
      icon: Volume2, 
      label: "Sound Effects", 
      desc: "Game sounds and music",
      enabled: soundEnabled, 
      toggle: () => setSoundEnabled(!soundEnabled) 
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      desc: "Daily reminders",
      enabled: notificationsEnabled, 
      toggle: () => setNotificationsEnabled(!notificationsEnabled) 
    },
  ];

  const linkSettings = [
    { icon: Globe, label: "Language", value: language },
    { icon: Shield, label: "Privacy", value: "" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        <div className="h-14 md:hidden flex-shrink-0" />
        
        <div className="flex-grow p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-1">Settings</h1>
              <p className="text-gray-500">Manage your preferences</p>
            </div>

            {/* Toggle Settings */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">General</h2>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200">
                {toggleSettings.map((setting, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <setting.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-black">{setting.label}</div>
                        <div className="text-sm text-gray-500">{setting.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={setting.toggle}
                      className={cn(
                        "w-12 h-7 rounded-full transition-colors relative",
                        setting.enabled ? "bg-[#0a33ff]" : "bg-gray-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                        setting.enabled ? "right-1" : "left-1"
                      )} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Link Settings */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Preferences</h2>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200">
                {linkSettings.map((setting, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <setting.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-black">{setting.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {setting.value && <span className="text-gray-500 text-sm">{setting.value}</span>}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Data</h2>
              <div className="bg-gray-50 rounded-2xl border border-gray-200">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-black">Reset Progress</div>
                      <div className="text-sm text-gray-500">Clear all game data</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Version */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
