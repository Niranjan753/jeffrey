"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Flame, Star, ChevronLeft, CheckCircle2, Clock, Trophy, Target, Coins, Heart, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  loadEngagementState,
  saveEngagementState,
  isDailyRewardAvailable,
  claimDailyReward,
  DAILY_REWARDS,
  formatTimeRemaining,
  getCurrentEvent,
  EngagementState,
} from "@/lib/engagement";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const [engagement, setEngagement] = useState<EngagementState | null>(null);
  const [showRewardClaimed, setShowRewardClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{ coins: number } | null>(null);
  const [timeUntilNextReward, setTimeUntilNextReward] = useState<string | null>(null);

  useEffect(() => {
    const state = loadEngagementState();
    setEngagement(state);
  }, []);

  useEffect(() => {
    if (!engagement) return;
    
    const canClaim = isDailyRewardAvailable(engagement);
    if (!canClaim && engagement.lastDailyRewardClaimed) {
      const lastClaimed = new Date(engagement.lastDailyRewardClaimed);
      const nextReward = new Date(lastClaimed);
      nextReward.setDate(nextReward.getDate() + 1);
      nextReward.setHours(0, 0, 0, 0);
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = nextReward.getTime() - now;
        if (remaining > 0) {
          setTimeUntilNextReward(formatTimeRemaining(remaining));
        } else {
          setTimeUntilNextReward(null);
          setEngagement(loadEngagementState());
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [engagement]);

  const handleClaimReward = () => {
    if (!engagement) return;
    
    const result = claimDailyReward(engagement);
    if (result) {
      setEngagement(result.newState);
      saveEngagementState(result.newState);
      setClaimedReward({ coins: result.reward.coins });
      setShowRewardClaimed(true);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0a33ff", "#000000", "#ffffff"],
      });
      
      setTimeout(() => {
        setShowRewardClaimed(false);
        setClaimedReward(null);
      }, 3000);
    }
  };

  const canClaimDaily = engagement ? isDailyRewardAvailable(engagement) : false;
  const currentRewardDay = engagement ? (engagement.dailyRewardDay % 7) : 0;
  const event = engagement ? getCurrentEvent(engagement) : null;

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <main className="flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black">Daily Rewards</h1>
              <p className="text-gray-500">Come back every day to earn bonus coins!</p>
            </div>
          </div>

          {/* Stats Bar */}
          {engagement && (
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white">
                <Coins className="w-4 h-4 text-black" />
                <span className="font-semibold text-black">{engagement.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white">
                <Flame className="w-4 h-4 text-white" />
                <span className="font-semibold text-white">{engagement.currentStreak} days</span>
              </div>
            </div>
          )}

          {/* Claim Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <motion.button
              onClick={handleClaimReward}
              disabled={!canClaimDaily}
              animate={canClaimDaily ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={cn(
                "w-full py-6 rounded-2xl font-bold text-xl transition-all",
                canClaimDaily
                  ? "bg-[#0a33ff] text-white hover:bg-[#0829cc] shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {canClaimDaily ? (
                <span className="flex items-center justify-center gap-3">
                  <Gift className="w-6 h-6" />
                  Claim Day {currentRewardDay + 1} Reward!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Clock className="w-6 h-6" />
                  Next reward in {timeUntilNextReward || "..."}
                </span>
              )}
            </motion.button>
          </motion.div>

          {/* 7-Day Calendar */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-black mb-4">Weekly Rewards</h2>
            <div className="grid grid-cols-7 gap-2">
              {DAILY_REWARDS.map((reward, index) => {
                const isClaimed = index < currentRewardDay;
                const isCurrent = index === currentRewardDay;
                const isFuture = index > currentRewardDay;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-3 rounded-xl border-2 text-center transition-all",
                      isClaimed && "bg-gray-50 border-gray-200",
                      isCurrent && canClaimDaily && "border-[#0a33ff] bg-blue-50/30",
                      isCurrent && !canClaimDaily && "border-gray-200 bg-gray-50",
                      isFuture && "border-gray-100 bg-white"
                    )}
                  >
                    <div className="text-xs text-gray-500 mb-1">Day {index + 1}</div>
                    
                    {isClaimed ? (
                      <CheckCircle2 className="w-6 h-6 mx-auto text-black" />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="w-4 h-4 text-black" />
                        <span className="text-sm font-bold text-black">{reward.coins}</span>
                      </div>
                    )}
                    
                    {reward.special === "bonus" && (
                      <div className="mt-1">
                        <Sparkles className="w-4 h-4 mx-auto text-[#0a33ff]" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Daily Challenge */}
          {engagement && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-black mb-4">Daily Challenge</h2>
              <div className={cn(
                "p-4 rounded-xl border-2",
                engagement.dailyChallengeCompleted ? "border-black bg-gray-50" : "border-gray-200 bg-white"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    engagement.dailyChallengeCompleted ? "bg-black" : "bg-[#0a33ff]"
                  )}>
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-black">
                      {engagement.dailyChallengeCompleted ? "Challenge Complete!" : "Complete Words"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {engagement.dailyChallengeProgress}/{engagement.dailyChallengeTarget} words
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-black">
                      <Coins className="w-4 h-4" />
                      200
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((engagement.dailyChallengeProgress / engagement.dailyChallengeTarget) * 100, 100)}%` }}
                    className={cn(
                      "h-full rounded-full",
                      engagement.dailyChallengeCompleted ? "bg-black" : "bg-[#0a33ff]"
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Event */}
          {event && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-black mb-4">Limited Event</h2>
              <div className="p-4 rounded-xl border-2 border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{event.emoji}</span>
                  <div className="flex-grow">
                    <h3 className="font-bold text-black">{event.name}</h3>
                    <p className="text-sm text-gray-500">
                      Ends in {formatTimeRemaining(event.timeRemaining)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-black">
                      <Trophy className="w-4 h-4" />
                      Bonus
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0a33ff] rounded-full transition-all"
                      style={{ width: `${(event.progress / event.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{event.progress}/{event.target}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          {engagement && (
            <div>
              <h2 className="text-lg font-bold text-black mb-4">Your Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-black">{engagement.wordsCompletedToday}</div>
                  <div className="text-xs text-gray-500">Words Today</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-black">{engagement.levelsCompletedToday}</div>
                  <div className="text-xs text-gray-500">Levels Today</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-black">{engagement.longestStreak}</div>
                  <div className="text-xs text-gray-500">Best Streak</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-black">{engagement.perfectLevels}</div>
                  <div className="text-xs text-gray-500">Perfect Levels</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reward Claimed Overlay */}
      <AnimatePresence>
        {showRewardClaimed && claimedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#0a33ff] flex items-center justify-center"
              >
                <Gift className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-black mb-4">Reward Claimed!</h2>
              
              <div className="flex items-center justify-center gap-2 text-2xl">
                <Coins className="w-8 h-8 text-black" />
                <span className="font-bold text-black">+{claimedReward.coins}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
