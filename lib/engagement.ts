// Credit-Based Engagement System
// Coins are spent to play levels and can be purchased

export interface EngagementState {
  // Currency (Main system)
  coins: number;
  gems: number;

  // Streak System (Habit Formation)
  currentStreak: number;
  lastPlayedDate: string | null;
  longestStreak: number;

  // Daily Rewards
  dailyRewardDay: number;
  lastDailyRewardClaimed: string | null;
  dailyRewardStreak: number;

  // Daily Challenge
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string | null;
  dailyChallengeProgress: number;
  dailyChallengeTarget: number;

  // Limited-time Events
  activeEvent: string | null;
  eventEndsAt: number | null;
  eventProgress: number;
  eventTarget: number;

  // Stats
  wordsCompletedToday: number;
  levelsCompletedToday: number;
  perfectLevels: number;
  totalCoinsSpent: number;
}

const DEFAULT_STATE: EngagementState = {
  coins: 500, // Start with 500 coins
  gems: 10,

  currentStreak: 0,
  lastPlayedDate: null,
  longestStreak: 0,

  dailyRewardDay: 0,
  lastDailyRewardClaimed: null,
  dailyRewardStreak: 0,

  dailyChallengeCompleted: false,
  dailyChallengeDate: null,
  dailyChallengeProgress: 0,
  dailyChallengeTarget: 10,

  activeEvent: null,
  eventEndsAt: null,
  eventProgress: 0,
  eventTarget: 0,

  wordsCompletedToday: 0,
  levelsCompletedToday: 0,
  perfectLevels: 0,
  totalCoinsSpent: 0,
};

const STORAGE_KEY = "word-game-engagement";

// Level costs - increases as you progress
export const LEVEL_COSTS = {
  easy: 10,
  medium: 20,
  hard: 30,
};

// Zone unlock costs (in gems)
export const ZONE_UNLOCK_COSTS = {
  free: 0,
  premium1: 15,
  premium2: 20,
  premium3: 25,
};

// Coin packages for purchase
export const COIN_PACKAGES = [
  { id: "starter", coins: 500, price: "$0.99", popular: false },
  { id: "basic", coins: 1500, price: "$2.99", popular: false },
  { id: "value", coins: 4000, price: "$4.99", popular: true },
  { id: "premium", coins: 10000, price: "$9.99", popular: false },
  { id: "mega", coins: 25000, price: "$19.99", popular: false },
];

// Gem packages for purchase
export const GEM_PACKAGES = [
  { id: "few", gems: 20, price: "$1.99" },
  { id: "some", gems: 50, price: "$3.99" },
  { id: "many", gems: 120, price: "$7.99" },
  { id: "lots", gems: 300, price: "$14.99" },
];

// Daily rewards table (7-day cycle)
export const DAILY_REWARDS = [
  { day: 1, coins: 100, gems: 0, special: null },
  { day: 2, coins: 150, gems: 0, special: null },
  { day: 3, coins: 200, gems: 1, special: null },
  { day: 4, coins: 250, gems: 0, special: null },
  { day: 5, coins: 300, gems: 2, special: null },
  { day: 6, coins: 400, gems: 0, special: null },
  { day: 7, coins: 500, gems: 5, special: "bonus" },
];

// Weekly events
export const WEEKLY_EVENTS = [
  { id: "word_rush", name: "Word Rush Weekend", emoji: "⚡", target: 30, reward: { coins: 500, gems: 10 } },
  { id: "perfect_week", name: "Perfect Week", emoji: "✨", target: 7, reward: { coins: 750, gems: 15 } },
  { id: "streak_challenge", name: "Streak Challenge", emoji: "🔥", target: 5, reward: { coins: 400, gems: 8 } },
];

// Celebration messages
export const CELEBRATION_MESSAGES = [
  { text: "AMAZING!", emoji: "🌟", color: "from-gray-800 to-black" },
  { text: "FANTASTIC!", emoji: "🎉", color: "from-blue-600 to-blue-800" },
  { text: "BRILLIANT!", emoji: "💎", color: "from-gray-700 to-gray-900" },
  { text: "SUPERSTAR!", emoji: "⭐", color: "from-black to-gray-800" },
  { text: "INCREDIBLE!", emoji: "🚀", color: "from-blue-700 to-indigo-900" },
];

// Near-miss messages
export const NEAR_MISS_MESSAGES = [
  "So close! 💪 One more try?",
  "Almost had it! 🎯 Keep going!",
  "Nearly perfect! 🌟 Try again!",
];

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split("T")[0];

// Load state from localStorage
export function loadEngagementState(): EngagementState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  
  try {
    const state = JSON.parse(saved) as EngagementState;
    return checkDayChange(state);
  } catch {
    return DEFAULT_STATE;
  }
}

// Save state to localStorage
export function saveEngagementState(state: EngagementState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Check if a new day has started and update streak
function checkDayChange(state: EngagementState): EngagementState {
  const today = getTodayString();
  
  if (state.lastPlayedDate === today) {
    return state;
  }
  
  const newState = { ...state };
  
  // Check if yesterday was played (for streak)
  if (state.lastPlayedDate) {
    const lastDate = new Date(state.lastPlayedDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newState.currentStreak = state.currentStreak + 1;
      newState.longestStreak = Math.max(newState.currentStreak, state.longestStreak);
    } else if (diffDays > 1) {
      newState.currentStreak = 0;
    }
  }
  
  // Reset daily counters
  newState.wordsCompletedToday = 0;
  newState.levelsCompletedToday = 0;
  
  // Reset daily challenge if it's a new day
  if (state.dailyChallengeDate !== today) {
    newState.dailyChallengeCompleted = false;
    newState.dailyChallengeDate = today;
    newState.dailyChallengeProgress = 0;
    newState.dailyChallengeTarget = Math.floor(Math.random() * 11) + 5;
  }
  
  return newState;
}

// Spend coins to play a level
export function spendCoinsForLevel(state: EngagementState, difficulty: "easy" | "medium" | "hard"): EngagementState | null {
  const cost = LEVEL_COSTS[difficulty];
  
  if (state.coins < cost) {
    return null; // Not enough coins
  }
  
  return {
    ...state,
    coins: state.coins - cost,
    totalCoinsSpent: state.totalCoinsSpent + cost,
  };
}

// Check if player can afford a level
export function canAffordLevel(state: EngagementState, difficulty: "easy" | "medium" | "hard"): boolean {
  return state.coins >= LEVEL_COSTS[difficulty];
}

// Spend gems to unlock a zone
export function spendGems(state: EngagementState, amount: number): EngagementState | null {
  if (state.gems < amount) {
    return null;
  }
  
  return {
    ...state,
    gems: state.gems - amount,
  };
}

// Add coins (from rewards, purchases, etc.)
export function addCoins(state: EngagementState, amount: number): EngagementState {
  return {
    ...state,
    coins: state.coins + amount,
  };
}

// Add gems
export function addGems(state: EngagementState, amount: number): EngagementState {
  return {
    ...state,
    gems: state.gems + amount,
  };
}

// Complete a word - earn coins
export function completeWord(state: EngagementState): EngagementState {
  const today = getTodayString();
  const coinsEarned = Math.floor(Math.random() * 10) + 5; // 5-15 coins
  
  const newState = {
    ...state,
    lastPlayedDate: today,
    coins: state.coins + coinsEarned,
    wordsCompletedToday: state.wordsCompletedToday + 1,
    dailyChallengeProgress: state.dailyChallengeProgress + 1,
  };
  
  // Check daily challenge completion
  if (!newState.dailyChallengeCompleted && newState.dailyChallengeProgress >= newState.dailyChallengeTarget) {
    newState.dailyChallengeCompleted = true;
    newState.coins += 200; // Bonus coins
    newState.gems += 2;
  }
  
  // Update event progress
  if (newState.activeEvent && newState.eventEndsAt && Date.now() < newState.eventEndsAt) {
    newState.eventProgress += 1;
  }
  
  return newState;
}

// Complete a level - earn bonus coins
export function completeLevel(state: EngagementState, perfect: boolean = false): EngagementState {
  const baseCoins = 30;
  const perfectBonus = perfect ? 50 : 0;
  const gemBonus = perfect ? 1 : 0;
  
  return {
    ...state,
    coins: state.coins + baseCoins + perfectBonus,
    gems: state.gems + gemBonus,
    levelsCompletedToday: state.levelsCompletedToday + 1,
    perfectLevels: perfect ? state.perfectLevels + 1 : state.perfectLevels,
  };
}

// Check if daily reward is available
export function isDailyRewardAvailable(state: EngagementState): boolean {
  if (!state.lastDailyRewardClaimed) return true;
  return state.lastDailyRewardClaimed !== getTodayString();
}

// Claim daily reward
export function claimDailyReward(state: EngagementState): { newState: EngagementState; reward: typeof DAILY_REWARDS[0] } | null {
  if (!isDailyRewardAvailable(state)) return null;
  
  const today = getTodayString();
  const rewardIndex = state.dailyRewardDay % 7;
  const reward = DAILY_REWARDS[rewardIndex];
  
  // Check streak
  let newStreak = 1;
  if (state.lastDailyRewardClaimed) {
    const lastDate = new Date(state.lastDailyRewardClaimed);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak = state.dailyRewardStreak + 1;
    }
  }
  
  const newState: EngagementState = {
    ...state,
    coins: state.coins + reward.coins,
    gems: state.gems + reward.gems,
    dailyRewardDay: state.dailyRewardDay + 1,
    lastDailyRewardClaimed: today,
    dailyRewardStreak: newStreak,
  };
  
  return { newState, reward };
}

// Start a weekly event
export function startWeeklyEvent(state: EngagementState): EngagementState {
  const eventIndex = Math.floor(Math.random() * WEEKLY_EVENTS.length);
  const event = WEEKLY_EVENTS[eventIndex];
  
  return {
    ...state,
    activeEvent: event.id,
    eventEndsAt: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days
    eventProgress: 0,
    eventTarget: event.target,
  };
}

// Get current event info
export function getCurrentEvent(state: EngagementState): { 
  name: string; 
  emoji: string; 
  progress: number; 
  target: number; 
  timeRemaining: number 
} | null {
  if (!state.activeEvent || !state.eventEndsAt) return null;
  
  const now = Date.now();
  if (now >= state.eventEndsAt) return null;
  
  const event = WEEKLY_EVENTS.find(e => e.id === state.activeEvent);
  if (!event) return null;
  
  return {
    name: event.name,
    emoji: event.emoji,
    progress: state.eventProgress,
    target: state.eventTarget,
    timeRemaining: state.eventEndsAt - now,
  };
}

// Format time remaining
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

// Get random celebration
export function getRandomCelebration() {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// Get random near-miss message
export function getRandomNearMiss() {
  return NEAR_MISS_MESSAGES[Math.floor(Math.random() * NEAR_MISS_MESSAGES.length)];
}

// Calculate level cost based on level number
export function getLevelCost(levelNum: number, difficulty: "easy" | "medium" | "hard"): number {
  const baseCost = LEVEL_COSTS[difficulty];
  // Slight increase per level
  return baseCost + Math.floor(levelNum / 3) * 5;
}
