"use client";

import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Flame, Clock, Zap, Heart, Gem, Coins, Check, Lock } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const [engagement, setEngagement] = useState<EngagementState | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [claimedReward, setClaimedReward] = useState<typeof DAILY_REWARDS[0] | null>(null);
  const [timeUntilLife, setTimeUntilLife] = useState<number | null>(null);

  useEffect(() => {
    const state = loadEngagementState();
    setEngagement(state);
    if (!state.activeEvent) {
      const newState = startWeeklyEvent(state);
      setEngagement(newState);
      saveEngagementState(newState);
    }
  }, []);

  useEffect(() => {
    if (!engagement) return;
    const interval = setInterval(() => {
      const time = getTimeUntilNextLife(engagement);
      setTimeUntilLife(time);
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
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000"] });
    }
  };

  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;
  const currentEvent = engagement ? getCurrentEvent(engagement) : null;
  const nextDayReward = engagement ? DAILY_REWARDS[(engagement.dailyRewardDay + 1) % 7] : DAILY_REWARDS[0];

  if (!engagement) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-grow relative flex flex-col min-w-0 h-full overflow-y-auto">
        <div className="h-14 md:hidden flex-shrink-0" />
        
        <div className="flex-grow p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-1">Rewards</h1>
              <p className="text-gray-500">Claim daily rewards and complete challenges</p>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white">
                <Heart className="w-4 h-4 text-black fill-black" />
                <span className="font-semibold text-black">{engagement.lives}/{engagement.maxLives}</span>
                {timeUntilLife && engagement.lives < engagement.maxLives && (
                  <span className="text-xs text-gray-400 ml-1">{formatTimeRemaining(timeUntilLife)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white">
                <Coins className="w-4 h-4 text-black" />
                <span className="font-semibold text-black">{engagement.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white">
                <Gem className="w-4 h-4 text-[#0a33ff]" />
                <span className="font-semibold text-black">{engagement.gems}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white">
                <Flame className="w-4 h-4" />
                <span className="font-semibold">{engagement.currentStreak} days</span>
              </div>
            </div>

            {/* Daily Reward Card */}
            <div className={cn(
              "rounded-2xl p-6 mb-6 border-2 transition-all",
              canClaimDaily ? "border-[#0a33ff] bg-blue-50/30" : "border-gray-200 bg-gray-50"
            )}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center",
                  canClaimDaily ? "bg-[#0a33ff]" : "bg-gray-200"
                )}>
                  <Gift className={cn("w-10 h-10", canClaimDaily ? "text-white" : "text-gray-400")} />
                </div>

                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-xl font-bold text-black mb-1">
                    {canClaimDaily ? "Daily Reward Ready!" : "Come Back Tomorrow"}
                  </h2>
                  <p className="text-gray-500 text-sm mb-3">
                    {canClaimDaily ? `Day ${(engagement.dailyRewardDay + 1)} reward` : "Keep your streak going"}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-black" />
                      <span className="font-semibold">{nextDayReward.coins}</span>
                    </div>
                    {nextDayReward.gems > 0 && (
                      <div className="flex items-center gap-1">
                        <Gem className="w-4 h-4 text-[#0a33ff]" />
                        <span className="font-semibold">{nextDayReward.gems}</span>
                      </div>
                    )}
                    {nextDayReward.lives > 0 && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-black" />
                        <span className="font-semibold">+{nextDayReward.lives}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleClaimDaily}
                  disabled={!canClaimDaily}
                  className={cn(
                    "px-8 py-4 rounded-xl font-semibold transition-colors",
                    canClaimDaily
                      ? "bg-[#0a33ff] text-white hover:bg-[#0829cc]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {canClaimDaily ? "Claim" : "Claimed ✓"}
                </button>
              </div>
            </div>

            {/* 7-Day Calendar */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-black">7-Day Calendar</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Flame className="w-4 h-4 text-black" />
                  <span className="font-semibold">{engagement.dailyRewardStreak} days</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {DAILY_REWARDS.map((reward, index) => {
                  const isPast = index < engagement.dailyRewardDay;
                  const isCurrent = index === engagement.dailyRewardDay;
                  const isFuture = index > engagement.dailyRewardDay;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "relative p-2 md:p-3 rounded-xl text-center transition-all",
                        isPast ? "bg-black text-white" : isCurrent ? "bg-[#0a33ff] text-white" : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {isFuture && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl">
                          <Lock className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <div className="text-[10px] font-semibold mb-1">Day {index + 1}</div>
                      <div className="text-lg mb-0.5">{isPast ? "✓" : "🎁"}</div>
                      <div className="text-[10px] font-medium">{reward.coins}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Challenge */}
            <div className={cn(
              "rounded-2xl p-6 border-2 mb-6",
              engagement.dailyChallengeCompleted ? "border-black bg-gray-50" : "border-[#0a33ff]"
            )}>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  engagement.dailyChallengeCompleted ? "bg-black" : "bg-[#0a33ff]"
                )}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-black">Daily Challenge</h3>
                    {!engagement.dailyChallengeCompleted && (
                      <span className="text-[10px] font-semibold text-[#0a33ff] bg-blue-50 px-2 py-0.5 rounded">TODAY</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">Complete {engagement.dailyChallengeTarget} words</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black">
                    {engagement.dailyChallengeProgress}/{engagement.dailyChallengeTarget}
                  </div>
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", engagement.dailyChallengeCompleted ? "bg-black" : "bg-[#0a33ff]")}
                  style={{ width: `${Math.min((engagement.dailyChallengeProgress / engagement.dailyChallengeTarget) * 100, 100)}%` }}
                />
              </div>

              {engagement.dailyChallengeCompleted && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-black" />
                  <span className="font-semibold text-black">Challenge Complete!</span>
                </div>
              )}
            </div>

            {/* Limited-Time Event */}
            {currentEvent && (
              <div className="rounded-2xl p-6 bg-black text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentEvent.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{currentEvent.name}</h3>
                        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded">LIMITED</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeRemaining(currentEvent.timeRemaining)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{currentEvent.progress}/{currentEvent.target}</div>
                </div>

                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${(currentEvent.progress / currentEvent.target) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reward Popup */}
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#0a33ff] flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-black mb-2">Reward Claimed!</h2>
              <p className="text-gray-500 mb-6">You received:</p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                    <Coins className="w-7 h-7 text-black" />
                  </div>
                  <div className="text-xl font-bold text-black">+{claimedReward.coins}</div>
                </div>

                {claimedReward.gems > 0 && (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                      <Gem className="w-7 h-7 text-[#0a33ff]" />
                    </div>
                    <div className="text-xl font-bold text-[#0a33ff]">+{claimedReward.gems}</div>
                  </div>
                )}

                {claimedReward.lives > 0 && (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                      <Heart className="w-7 h-7 text-black" />
                    </div>
                    <div className="text-xl font-bold text-black">+{claimedReward.lives}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowRewardPopup(false)}
                className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
