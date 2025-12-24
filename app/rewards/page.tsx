"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Flame, Clock, Sparkles, Zap, Star, Heart, Gem, Coins, Trophy, Calendar, ChevronRight, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import {
  loadEngagementState,
  saveEngagementState,
  claimDailyReward,
  isDailyRewardAvailable,
  DAILY_REWARDS,
  getCurrentEvent,
  startWeeklyEvent,
  formatTimeRemaining,
  getTimeUntilNextLife,
  EngagementState,
} from "@/lib/engagement";
import confetti from "canvas-confetti";

export default function RewardsPage() {
  const [engagement, setEngagement] = useState<EngagementState | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [claimedReward, setClaimedReward] = useState<typeof DAILY_REWARDS[0] | null>(null);
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);

  useEffect(() => {
    const state = loadEngagementState();
    setEngagement(state);
    
    // Start an event if none active
    if (!state.activeEvent) {
      const newState = startWeeklyEvent(state);
      setEngagement(newState);
      saveEngagementState(newState);
    }
  }, []);

  // Timer for life regeneration
  useEffect(() => {
    if (!engagement) return;
    
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
      
      // Reload state to get regenerated lives
      const newState = loadEngagementState();
      if (newState.lives !== engagement.lives) {
        setEngagement(newState);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [engagement]);

  const handleClaimDaily = () => {
    if (!engagement) return;
    
    const result = claimDailyReward(engagement);
    if (result) {
      setEngagement(result.newState);
      saveEngagementState(result.newState);
      setClaimedReward(result.reward);
      setShowRewardPopup(true);
      
      // Celebration confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#fbbf24", "#f59e0b", "#ec4899", "#8b5cf6"],
      });
    }
  };

  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;
  const currentEvent = engagement ? getCurrentEvent(engagement) : null;
  const nextDayReward = engagement ? DAILY_REWARDS[(engagement.dailyRewardDay + 1) % 7] : DAILY_REWARDS[0];

  if (!engagement) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {/* Mobile Top Padding */}
        <div className="h-16 md:hidden flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-grow p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header with Stats */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-200">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900">Daily Rewards</h1>
                  <p className="text-lg text-gray-600 font-medium">Claim rewards & complete challenges!</p>
                </div>
              </div>

              {/* Resource Bar */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-pink-100 shadow-lg">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  <span className="font-black text-pink-600">{engagement.lives}/{engagement.maxLives}</span>
                  {timeUntilLife && engagement.lives < engagement.maxLives && (
                    <span className="text-xs font-bold text-pink-400 ml-1">
                      +1 in {formatTimeRemaining(timeUntilLife)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-yellow-100 shadow-lg">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="font-black text-yellow-600">{engagement.coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-purple-100 shadow-lg">
                  <Gem className="w-5 h-5 text-purple-500" />
                  <span className="font-black text-purple-600">{engagement.gems}</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-orange-100 shadow-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-black text-orange-600">{engagement.currentStreak} day streak</span>
                </div>
              </div>
            </motion.div>

            {/* Daily Reward Claim Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`relative rounded-3xl p-6 md:p-8 mb-6 border-4 overflow-hidden ${
                canClaimDaily 
                  ? "bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-amber-300 shadow-2xl shadow-amber-200/50" 
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              {/* Animated background for claimable */}
              {canClaimDaily && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle at center, #fbbf24 0%, transparent 70%)",
                  }}
                />
              )}

              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <motion.div
                  animate={canClaimDaily ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                    canClaimDaily 
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl" 
                      : "bg-gray-300"
                  }`}
                >
                  <Gift className={`w-12 h-12 ${canClaimDaily ? "text-white" : "text-gray-500"}`} />
                </motion.div>

                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                    {canClaimDaily ? "🎁 Your Daily Gift is Ready!" : "Come Back Tomorrow!"}
                  </h2>
                  <p className="text-gray-600 font-medium mb-3">
                    {canClaimDaily 
                      ? `Day ${(engagement.dailyRewardDay + 1)} reward waiting for you!` 
                      : "You've claimed today's reward. Keep your streak going!"}
                  </p>
                  
                  {/* Preview of reward */}
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1.5 text-yellow-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{nextDayReward.coins}</span>
                    </div>
                    {nextDayReward.gems > 0 && (
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <Gem className="w-4 h-4" />
                        <span className="font-bold">{nextDayReward.gems}</span>
                      </div>
                    )}
                    {nextDayReward.lives > 0 && (
                      <div className="flex items-center gap-1.5 text-pink-600">
                        <Heart className="w-4 h-4" />
                        <span className="font-bold">+{nextDayReward.lives}</span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={canClaimDaily ? { scale: 1.05 } : {}}
                  whileTap={canClaimDaily ? { scale: 0.95 } : {}}
                  onClick={handleClaimDaily}
                  disabled={!canClaimDaily}
                  className={`px-8 py-4 rounded-2xl text-xl font-black transition-all ${
                    canClaimDaily
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-300 hover:shadow-2xl hover:shadow-orange-400"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canClaimDaily ? "CLAIM!" : "CLAIMED ✓"}
                </motion.button>
              </div>
            </motion.div>

            {/* 7-Day Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-black text-gray-900">7-Day Reward Calendar</h3>
                <div className="ml-auto flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-600 text-sm">{engagement.dailyRewardStreak} days</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {DAILY_REWARDS.map((reward, index) => {
                  const isPast = index < engagement.dailyRewardDay;
                  const isCurrent = index === engagement.dailyRewardDay;
                  const isFuture = index > engagement.dailyRewardDay;
                  const isDay7 = index === 6;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`relative p-2 md:p-3 rounded-xl md:rounded-2xl text-center transition-all ${
                        isPast 
                          ? "bg-green-50 border-2 border-green-200" 
                          : isCurrent 
                            ? "bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 shadow-lg ring-2 ring-amber-200" 
                            : "bg-gray-50 border-2 border-gray-100"
                      } ${isDay7 ? "col-span-1" : ""}`}
                    >
                      {isPast && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                      
                      {isCurrent && canClaimDaily && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-2 -right-2"
                        >
                          <Sparkles className="w-5 h-5 text-amber-500" />
                        </motion.div>
                      )}

                      {isFuture && (
                        <div className="absolute inset-0 bg-gray-100/50 rounded-xl md:rounded-2xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

                      <div className={`text-xs font-bold mb-1 ${isPast ? "text-green-600" : isCurrent ? "text-amber-600" : "text-gray-400"}`}>
                        Day {index + 1}
                      </div>
                      
                      <div className="text-lg md:text-2xl mb-1">
                        {isDay7 ? "🎁" : isPast ? "✨" : "🎁"}
                      </div>
                      
                      <div className={`text-[10px] md:text-xs font-bold ${isPast ? "text-green-600" : isCurrent ? "text-amber-700" : "text-gray-400"}`}>
                        {reward.coins}
                        <Coins className="w-2.5 h-2.5 md:w-3 md:h-3 inline ml-0.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Daily Challenge - FOMO Element */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-3xl p-6 mb-6 border-3 ${
                engagement.dailyChallengeCompleted 
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300" 
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  engagement.dailyChallengeCompleted 
                    ? "bg-green-500" 
                    : "bg-blue-500"
                }`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">Daily Challenge</h3>
                    {!engagement.dailyChallengeCompleted && (
                      <div className="flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-bold text-red-600">Today Only!</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    Complete {engagement.dailyChallengeTarget} words today
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">
                    {engagement.dailyChallengeProgress}/{engagement.dailyChallengeTarget}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold">+100</span>
                    <Gem className="w-4 h-4 text-purple-500 ml-1" />
                    <span className="font-bold text-purple-600">+2</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 bg-white/80 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((engagement.dailyChallengeProgress / engagement.dailyChallengeTarget) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    engagement.dailyChallengeCompleted 
                      ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                      : "bg-gradient-to-r from-blue-400 to-indigo-500"
                  }`}
                />
              </div>

              {engagement.dailyChallengeCompleted && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl font-bold">
                    <Trophy className="w-5 h-5" />
                    Challenge Complete! Rewards Collected!
                  </span>
                </div>
              )}
            </motion.div>

            {/* Limited-Time Event - Maximum FOMO */}
            {currentEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative rounded-3xl p-6 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "conic-gradient(from 0deg, transparent, white, transparent)",
                  }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{currentEvent.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black">{currentEvent.name}</h3>
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                            LIMITED TIME
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white/80 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">
                            Ends in {formatTimeRemaining(currentEvent.timeRemaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black">{currentEvent.progress}/{currentEvent.target}</div>
                      <div className="text-sm opacity-80">words completed</div>
                    </div>
                  </div>

                  {/* Event Progress */}
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentEvent.progress / currentEvent.target) * 100}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>

                  {/* Event Rewards */}
                  <div className="flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
                    <span className="font-bold">Event Rewards:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Coins className="w-5 h-5 text-yellow-300" />
                        <span className="font-black">{currentEvent.reward.coins}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gem className="w-5 h-5 text-purple-300" />
                        <span className="font-black">{currentEvent.reward.gems}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-60" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Reward Claim Popup */}
      <AnimatePresence>
        {showRewardPopup && claimedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowRewardPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 10 }}
                transition={{ delay: 0.2, type: "spring", damping: 10, stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>

              <h2 className="text-3xl font-black text-gray-900 mb-2">Reward Claimed!</h2>
              <p className="text-gray-600 mb-6">You received:</p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-2">
                    <Coins className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-black text-yellow-600">+{claimedReward.coins}</div>
                </motion.div>

                {claimedReward.gems > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-2">
                      <Gem className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-black text-purple-600">+{claimedReward.gems}</div>
                  </motion.div>
                )}

                {claimedReward.lives > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center mb-2">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <div className="text-2xl font-black text-pink-600">+{claimedReward.lives}</div>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRewardPopup(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl text-xl font-black shadow-xl"
              >
                AWESOME!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

