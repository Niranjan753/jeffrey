// Candy Crush-inspired Engagement System
// Implements: Lives, Streaks, Daily Rewards, Coins, and Variable Rewards

export interface EngagementState {
  // Lives System (Loss Aversion + Time Gates)
  lives: number;
  maxLives: number;
  lastLifeLostAt: number | null;
  lifeRegenTimeMinutes: number;

  // Streak System (FOMO + Habit Formation)
  currentStreak: number;
  lastPlayedDate: string | null;
  longestStreak: number;

  // Currency (Variable Rewards)
  coins: number;
  gems: number;

  // Daily Rewards
  dailyRewardDay: number;
  lastDailyRewardClaimed: string | null;
  dailyRewardStreak: number;

  // Daily Challenge
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string | null;
  dailyChallengeProgress: number;
  dailyChallengeTarget: number;

  // Limited-time Events (FOMO)
  activeEvent: string | null;
  eventEndsAt: number | null;
  eventProgress: number;
  eventTarget: number;

  // Stats for variable rewards
  wordsCompletedToday: number;
  levelsCompletedToday: number;
  perfectLevels: number;
}

const DEFAULT_STATE: EngagementState = {
  lives: 5,
  maxLives: 5,
  lastLifeLostAt: null,
  lifeRegenTimeMinutes: 30,

  currentStreak: 0,
  lastPlayedDate: null,
  longestStreak: 0,

  coins: 100,
  gems: 5,

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
};

const STORAGE_KEY = "word-game-engagement";

// Daily rewards table (7-day cycle, then repeats with bonuses)
export const DAILY_REWARDS = [
  { day: 1, coins: 50, gems: 0, lives: 0, special: null },
  { day: 2, coins: 75, gems: 0, lives: 0, special: null },
  { day: 3, coins: 100, gems: 1, lives: 0, special: null },
  { day: 4, coins: 125, gems: 0, lives: 0, special: null },
  { day: 5, coins: 150, gems: 0, lives: 1, special: null },
  { day: 6, coins: 200, gems: 2, lives: 0, special: null },
  { day: 7, coins: 300, gems: 5, lives: 2, special: "mystery_box" },
];

// Weekly limited-time events
export const WEEKLY_EVENTS = [
  { id: "word_rush", name: "Word Rush Weekend", emoji: "⚡", target: 30, reward: { coins: 500, gems: 10 } },
  { id: "perfect_week", name: "Perfect Week", emoji: "✨", target: 7, reward: { coins: 750, gems: 15 } },
  { id: "streak_challenge", name: "Streak Challenge", emoji: "🔥", target: 5, reward: { coins: 400, gems: 8 } },
  { id: "speed_demon", name: "Speed Demon", emoji: "🏃", target: 15, reward: { coins: 600, gems: 12 } },
];

// Celebration messages for variable rewards (random selection = dopamine)
export const CELEBRATION_MESSAGES = [
  { text: "AMAZING!", emoji: "🌟", color: "from-yellow-400 to-orange-500" },
  { text: "FANTASTIC!", emoji: "🎉", color: "from-pink-500 to-purple-600" },
  { text: "BRILLIANT!", emoji: "💎", color: "from-blue-400 to-cyan-500" },
  { text: "SUPERSTAR!", emoji: "⭐", color: "from-amber-400 to-yellow-500" },
  { text: "INCREDIBLE!", emoji: "🚀", color: "from-purple-500 to-indigo-600" },
  { text: "WONDERFUL!", emoji: "🌈", color: "from-green-400 to-teal-500" },
  { text: "LEGENDARY!", emoji: "👑", color: "from-amber-500 to-red-500" },
];

// Near-miss messages (loss aversion psychology)
export const NEAR_MISS_MESSAGES = [
  "So close! 💪 One more try?",
  "Almost had it! 🎯 You're getting better!",
  "You were THIS close! ⚡ Try again!",
  "Nearly perfect! 🌟 Keep going!",
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
    return regenerateLives(checkDayChange(state));
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
      // Consecutive day - increment streak
      newState.currentStreak = state.currentStreak + 1;
      newState.longestStreak = Math.max(newState.currentStreak, state.longestStreak);
    } else if (diffDays > 1) {
      // Streak broken
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
    // Randomize daily challenge target (5-15 words) - variable rewards
    newState.dailyChallengeTarget = Math.floor(Math.random() * 11) + 5;
  }
  
  return newState;
}

// Regenerate lives based on time passed
function regenerateLives(state: EngagementState): EngagementState {
  if (state.lives >= state.maxLives || !state.lastLifeLostAt) {
    return state;
  }
  
  const now = Date.now();
  const timePassed = now - state.lastLifeLostAt;
  const regenTime = state.lifeRegenTimeMinutes * 60 * 1000;
  const livesToRegen = Math.floor(timePassed / regenTime);
  
  if (livesToRegen > 0) {
    const newLives = Math.min(state.lives + livesToRegen, state.maxLives);
    return {
      ...state,
      lives: newLives,
      lastLifeLostAt: newLives >= state.maxLives ? null : state.lastLifeLostAt + (livesToRegen * regenTime),
    };
  }
  
  return state;
}

// Lose a life (called when failing a level or giving up)
export function loseLife(state: EngagementState): EngagementState {
  if (state.lives <= 0) return state;
  
  return {
    ...state,
    lives: state.lives - 1,
    lastLifeLostAt: Date.now(),
  };
}

// Get time until next life regeneration
export function getTimeUntilNextLife(state: EngagementState): number | null {
  if (state.lives >= state.maxLives || !state.lastLifeLostAt) {
    return null;
  }
  
  const now = Date.now();
  const regenTime = state.lifeRegenTimeMinutes * 60 * 1000;
  const timePassed = now - state.lastLifeLostAt;
  const timeUntilNext = regenTime - (timePassed % regenTime);
  
  return Math.max(0, timeUntilNext);
}

// Add a life (reward, purchase, etc.)
export function addLife(state: EngagementState, count: number = 1): EngagementState {
  const newLives = Math.min(state.lives + count, state.maxLives + 2); // Allow overflow slightly
  return {
    ...state,
    lives: newLives,
    lastLifeLostAt: newLives >= state.maxLives ? null : state.lastLifeLostAt,
  };
}

// Complete a word - update progress and give rewards
export function completeWord(state: EngagementState): EngagementState {
  const today = getTodayString();
  const coinsEarned = Math.floor(Math.random() * 15) + 10; // 10-25 coins (variable)
  
  const newState = {
    ...state,
    lastPlayedDate: today,
    coins: state.coins + coinsEarned,
    wordsCompletedToday: state.wordsCompletedToday + 1,
    dailyChallengeProgress: state.dailyChallengeProgress + 1,
    eventProgress: state.activeEvent ? state.eventProgress + 1 : 0,
  };
  
  // Check if daily challenge completed
  if (!newState.dailyChallengeCompleted && newState.dailyChallengeProgress >= newState.dailyChallengeTarget) {
    newState.dailyChallengeCompleted = true;
    newState.coins += 100; // Bonus for completing daily challenge
    newState.gems += 2;
  }
  
  return newState;
}

// Complete a level
export function completeLevel(state: EngagementState, perfect: boolean = false): EngagementState {
  const coinsEarned = perfect ? 100 : 50; // Perfect completion bonus
  const gemsEarned = perfect ? 1 : 0;
  
  return {
    ...state,
    coins: state.coins + coinsEarned,
    gems: state.gems + gemsEarned,
    levelsCompletedToday: state.levelsCompletedToday + 1,
    perfectLevels: perfect ? state.perfectLevels + 1 : state.perfectLevels,
  };
}

// Claim daily reward
export function claimDailyReward(state: EngagementState): { newState: EngagementState; reward: typeof DAILY_REWARDS[0] } | null {
  const today = getTodayString();
  
  // Already claimed today
  if (state.lastDailyRewardClaimed === today) {
    return null;
  }
  
  // Check if continuing streak or starting fresh
  let dayIndex = state.dailyRewardDay;
  if (state.lastDailyRewardClaimed) {
    const lastClaim = new Date(state.lastDailyRewardClaimed);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      dayIndex = (state.dailyRewardDay + 1) % 7;
    } else if (diffDays > 1) {
      dayIndex = 0; // Reset to day 1
    }
  }
  
  const reward = DAILY_REWARDS[dayIndex];
  const streakMultiplier = Math.min(1 + (state.dailyRewardStreak * 0.1), 2); // Up to 2x multiplier
  
  const newState: EngagementState = {
    ...state,
    coins: state.coins + Math.floor(reward.coins * streakMultiplier),
    gems: state.gems + reward.gems,
    lives: addLife(state, reward.lives).lives,
    dailyRewardDay: dayIndex,
    lastDailyRewardClaimed: today,
    dailyRewardStreak: state.lastDailyRewardClaimed ? state.dailyRewardStreak + 1 : 1,
  };
  
  return { newState, reward };
}

// Check if daily reward is available
export function isDailyRewardAvailable(state: EngagementState): boolean {
  const today = getTodayString();
  return state.lastDailyRewardClaimed !== today;
}

// Get random celebration message (variable reward)
export function getRandomCelebration() {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// Get random near-miss message (loss aversion)
export function getRandomNearMiss() {
  return NEAR_MISS_MESSAGES[Math.floor(Math.random() * NEAR_MISS_MESSAGES.length)];
}

// Start a limited-time event
export function startWeeklyEvent(state: EngagementState): EngagementState {
  const event = WEEKLY_EVENTS[Math.floor(Math.random() * WEEKLY_EVENTS.length)];
  const endsAt = Date.now() + (48 * 60 * 60 * 1000); // 48 hours
  
  return {
    ...state,
    activeEvent: event.id,
    eventEndsAt: endsAt,
    eventProgress: 0,
    eventTarget: event.target,
  };
}

// Get current event details
export function getCurrentEvent(state: EngagementState) {
  if (!state.activeEvent || !state.eventEndsAt) return null;
  
  if (Date.now() > state.eventEndsAt) {
    return null; // Event expired
  }
  
  const event = WEEKLY_EVENTS.find(e => e.id === state.activeEvent);
  if (!event) return null;
  
  return {
    ...event,
    progress: state.eventProgress,
    target: state.eventTarget,
    endsAt: state.eventEndsAt,
    timeRemaining: state.eventEndsAt - Date.now(),
  };
}

// Spend coins
export function spendCoins(state: EngagementState, amount: number): EngagementState | null {
  if (state.coins < amount) return null;
  return { ...state, coins: state.coins - amount };
}

// Spend gems (premium currency)
export function spendGems(state: EngagementState, amount: number): EngagementState | null {
  if (state.gems < amount) return null;
  return { ...state, gems: state.gems - amount };
}

// Buy extra lives with gems
export function buyLivesWithGems(state: EngagementState): EngagementState | null {
  const cost = 3; // 3 gems for full lives
  if (state.gems < cost) return null;
  
  return {
    ...state,
    gems: state.gems - cost,
    lives: state.maxLives,
    lastLifeLostAt: null,
  };
}

// Format time remaining (for lives, events, etc.)
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

