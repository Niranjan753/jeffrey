export type GameType = "spell" | "crossword" | "scramble" | "search" | "match";

export interface WordData {
  id: string;
  word: string;
  hint?: string;
  image?: string;
}

export interface CrosswordClue {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface SearchGridData {
  grid: string[][];
  words: string[];
  size: number;
}

export interface MatchPair {
  word: string;
  image: string;
}

export interface LevelData {
  level: number;
  words: WordData[];
  theme: string;
}

export interface GameZone {
  id: string;
  name: string;
  emoji: string;
  gameType: GameType;
  description: string;
  color: string;
  bgGradient: string;
  unlockCost: number; // 0 = free
  levels: ZoneLevel[];
}

export interface ZoneLevel {
  id: string;
  levelNum: number;
  difficulty: "easy" | "medium" | "hard";
  // For spell game
  words?: WordData[];
  // For crossword
  crossword?: CrosswordClue[];
  gridSize?: number;
  // For scramble
  scrambleWords?: { word: string; hint: string }[];
  timeLimit?: number; // seconds
  // For word search
  searchData?: SearchGridData;
  // For match
  matchPairs?: MatchPair[];
}

// Legacy export for backwards compatibility
export const LEVELS: LevelData[] = [
  {
    level: 1,
    theme: "#FF6B6B",
    words: [
      { id: "1-1", word: "CAT", image: "/cat.jpeg" },
      { id: "1-2", word: "DOG", image: "/dog.jpeg" },
      { id: "1-3", word: "SUN", image: "/sun.jpeg" },
      { id: "1-4", word: "BAT", image: "/bat.jpeg" },
      { id: "1-5", word: "CUP", image: "/cup.jpeg" },
    ],
  },
  {
    level: 2,
    theme: "#4ECDC4",
    words: [
      { id: "2-1", word: "FISH", image: "/fish.jpeg" },
      { id: "2-2", word: "BIRD", image: "/bird.jpeg" },
      { id: "2-3", word: "FROG", image: "/frog.jpeg" },
      { id: "2-4", word: "STAR", image: "/star.jpeg" },
      { id: "2-5", word: "CAKE", image: "/cake.jpeg" },
    ],
  },
  {
    level: 3,
    theme: "#FFE66D",
    words: [
      { id: "3-1", word: "APPLE", image: "/apple.jpeg" },
      { id: "3-2", word: "SMILE", image: "/smile.jpeg" },
      { id: "3-3", word: "HOUSE", image: "/house.jpeg" },
      { id: "3-4", word: "MOUSE", image: "/mouse.jpeg" },
      { id: "3-5", word: "TRAIN", image: "/train.jpeg" },
    ],
  },
];

// New comprehensive game zones
export const GAME_ZONES: GameZone[] = [
  // Zone 1: Word Spell (FREE)
  {
    id: "spell-meadow",
    name: "Spelling Meadow",
    emoji: "🌸",
    gameType: "spell",
    description: "Arrange letters to spell words",
    color: "#FF6B6B",
    bgGradient: "from-pink-400 to-rose-500",
    unlockCost: 0,
    levels: [
      {
        id: "spell-1",
        levelNum: 1,
        difficulty: "easy",
        words: [
          { id: "s1-1", word: "CAT", image: "/cat.jpeg" },
          { id: "s1-2", word: "DOG", image: "/dog.jpeg" },
          { id: "s1-3", word: "SUN", image: "/sun.jpeg" },
        ],
      },
      {
        id: "spell-2",
        levelNum: 2,
        difficulty: "easy",
        words: [
          { id: "s2-1", word: "BAT", image: "/bat.jpeg" },
          { id: "s2-2", word: "CUP", image: "/cup.jpeg" },
          { id: "s2-3", word: "HAT" },
        ],
      },
      {
        id: "spell-3",
        levelNum: 3,
        difficulty: "easy",
        words: [
          { id: "s3-1", word: "FISH", image: "/fish.jpeg" },
          { id: "s3-2", word: "BIRD", image: "/bird.jpeg" },
          { id: "s3-3", word: "FROG", image: "/frog.jpeg" },
        ],
      },
      {
        id: "spell-4",
        levelNum: 4,
        difficulty: "medium",
        words: [
          { id: "s4-1", word: "STAR", image: "/star.jpeg" },
          { id: "s4-2", word: "CAKE", image: "/cake.jpeg" },
          { id: "s4-3", word: "TREE" },
        ],
      },
      {
        id: "spell-5",
        levelNum: 5,
        difficulty: "medium",
        words: [
          { id: "s5-1", word: "APPLE", image: "/apple.jpeg" },
          { id: "s5-2", word: "SMILE", image: "/smile.jpeg" },
          { id: "s5-3", word: "HOUSE", image: "/house.jpeg" },
        ],
      },
      {
        id: "spell-6",
        levelNum: 6,
        difficulty: "medium",
        words: [
          { id: "s6-1", word: "MOUSE", image: "/mouse.jpeg" },
          { id: "s6-2", word: "TRAIN", image: "/train.jpeg" },
          { id: "s6-3", word: "WATER" },
        ],
      },
      {
        id: "spell-7",
        levelNum: 7,
        difficulty: "hard",
        words: [
          { id: "s7-1", word: "BANANA" },
          { id: "s7-2", word: "ORANGE" },
          { id: "s7-3", word: "FLOWER" },
        ],
      },
      {
        id: "spell-8",
        levelNum: 8,
        difficulty: "hard",
        words: [
          { id: "s8-1", word: "RAINBOW" },
          { id: "s8-2", word: "ELEPHANT" },
          { id: "s8-3", word: "BUTTERFLY" },
        ],
      },
    ],
  },
  
  // Zone 2: Word Scramble (FREE)
  {
    id: "scramble-canyon",
    name: "Scramble Canyon",
    emoji: "🌀",
    gameType: "scramble",
    description: "Unscramble jumbled letters quickly",
    color: "#4ECDC4",
    bgGradient: "from-teal-400 to-cyan-500",
    unlockCost: 0,
    levels: [
      {
        id: "scram-1",
        levelNum: 1,
        difficulty: "easy",
        timeLimit: 60,
        scrambleWords: [
          { word: "CAT", hint: "A furry pet that meows" },
          { word: "DOG", hint: "Man's best friend" },
          { word: "SUN", hint: "Bright in the sky" },
        ],
      },
      {
        id: "scram-2",
        levelNum: 2,
        difficulty: "easy",
        timeLimit: 60,
        scrambleWords: [
          { word: "BALL", hint: "Round toy to play with" },
          { word: "FISH", hint: "Swims in water" },
          { word: "BIRD", hint: "Has wings and flies" },
        ],
      },
      {
        id: "scram-3",
        levelNum: 3,
        difficulty: "medium",
        timeLimit: 45,
        scrambleWords: [
          { word: "APPLE", hint: "A red or green fruit" },
          { word: "HOUSE", hint: "Where you live" },
          { word: "TRAIN", hint: "Runs on tracks" },
        ],
      },
      {
        id: "scram-4",
        levelNum: 4,
        difficulty: "medium",
        timeLimit: 45,
        scrambleWords: [
          { word: "SCHOOL", hint: "Where you learn" },
          { word: "FRIEND", hint: "Someone you like" },
          { word: "PLANET", hint: "Earth is one" },
        ],
      },
      {
        id: "scram-5",
        levelNum: 5,
        difficulty: "hard",
        timeLimit: 30,
        scrambleWords: [
          { word: "RAINBOW", hint: "Colorful arc in the sky" },
          { word: "MONSTER", hint: "Scary creature" },
          { word: "DANCING", hint: "Moving to music" },
        ],
      },
      {
        id: "scram-6",
        levelNum: 6,
        difficulty: "hard",
        timeLimit: 30,
        scrambleWords: [
          { word: "ELEPHANT", hint: "Big animal with trunk" },
          { word: "PRINCESS", hint: "Royal daughter" },
          { word: "DINOSAUR", hint: "Extinct reptile" },
        ],
      },
    ],
  },
  
  // Zone 3: Crossword (PREMIUM - 15 gems)
  {
    id: "crossword-castle",
    name: "Crossword Castle",
    emoji: "🏰",
    gameType: "crossword",
    description: "Solve fun crossword puzzles",
    color: "#9B59B6",
    bgGradient: "from-purple-500 to-indigo-600",
    unlockCost: 15,
    levels: [
      {
        id: "cross-1",
        levelNum: 1,
        difficulty: "easy",
        gridSize: 5,
        crossword: [
          { word: "CAT", clue: "Furry pet that meows", row: 0, col: 0, direction: "across" },
          { word: "CUP", clue: "Drink from this", row: 0, col: 0, direction: "down" },
          { word: "TOP", clue: "Opposite of bottom", row: 2, col: 2, direction: "across" },
        ],
      },
      {
        id: "cross-2",
        levelNum: 2,
        difficulty: "easy",
        gridSize: 6,
        crossword: [
          { word: "STAR", clue: "Twinkles at night", row: 0, col: 0, direction: "across" },
          { word: "SUN", clue: "Bright and warm", row: 0, col: 0, direction: "down" },
          { word: "ANT", clue: "Tiny insect", row: 2, col: 2, direction: "across" },
          { word: "NET", clue: "Catch fish with this", row: 0, col: 3, direction: "down" },
        ],
      },
      {
        id: "cross-3",
        levelNum: 3,
        difficulty: "medium",
        gridSize: 7,
        crossword: [
          { word: "APPLE", clue: "Red or green fruit", row: 0, col: 0, direction: "across" },
          { word: "ANT", clue: "Works in a colony", row: 0, col: 0, direction: "down" },
          { word: "PLANE", clue: "Flies in the sky", row: 2, col: 2, direction: "across" },
          { word: "EAGLE", clue: "Majestic bird", row: 0, col: 4, direction: "down" },
        ],
      },
      {
        id: "cross-4",
        levelNum: 4,
        difficulty: "medium",
        gridSize: 7,
        crossword: [
          { word: "HOUSE", clue: "You live here", row: 0, col: 0, direction: "across" },
          { word: "HORSE", clue: "You can ride it", row: 0, col: 0, direction: "down" },
          { word: "SMILE", clue: "Happy expression", row: 2, col: 2, direction: "across" },
          { word: "EAGLE", clue: "Bird of prey", row: 0, col: 4, direction: "down" },
        ],
      },
      {
        id: "cross-5",
        levelNum: 5,
        difficulty: "hard",
        gridSize: 8,
        crossword: [
          { word: "RAINBOW", clue: "Colorful arc after rain", row: 0, col: 0, direction: "across" },
          { word: "ROCKET", clue: "Goes to space", row: 0, col: 0, direction: "down" },
          { word: "ISLAND", clue: "Land surrounded by water", row: 2, col: 2, direction: "across" },
          { word: "WINDOW", clue: "See through it", row: 0, col: 6, direction: "down" },
        ],
      },
    ],
  },
  
  // Zone 4: Word Search (PREMIUM - 20 gems)
  {
    id: "search-jungle",
    name: "Search Jungle",
    emoji: "🌴",
    gameType: "search",
    description: "Find hidden words in the grid",
    color: "#27AE60",
    bgGradient: "from-green-500 to-emerald-600",
    unlockCost: 20,
    levels: [
      {
        id: "search-1",
        levelNum: 1,
        difficulty: "easy",
        searchData: {
          size: 6,
          words: ["CAT", "DOG", "SUN"],
          grid: [
            ["C", "A", "T", "X", "P", "Q"],
            ["D", "O", "G", "R", "S", "T"],
            ["S", "U", "N", "A", "B", "C"],
            ["M", "N", "O", "P", "Q", "R"],
            ["E", "F", "G", "H", "I", "J"],
            ["K", "L", "M", "N", "O", "P"],
          ],
        },
      },
      {
        id: "search-2",
        levelNum: 2,
        difficulty: "easy",
        searchData: {
          size: 6,
          words: ["FISH", "BIRD", "FROG"],
          grid: [
            ["F", "I", "S", "H", "X", "Y"],
            ["B", "I", "R", "D", "Z", "A"],
            ["F", "R", "O", "G", "B", "C"],
            ["D", "E", "F", "G", "H", "I"],
            ["J", "K", "L", "M", "N", "O"],
            ["P", "Q", "R", "S", "T", "U"],
          ],
        },
      },
      {
        id: "search-3",
        levelNum: 3,
        difficulty: "medium",
        searchData: {
          size: 8,
          words: ["APPLE", "HOUSE", "TRAIN", "SMILE"],
          grid: [
            ["A", "P", "P", "L", "E", "X", "Y", "Z"],
            ["H", "O", "U", "S", "E", "A", "B", "C"],
            ["T", "R", "A", "I", "N", "D", "E", "F"],
            ["S", "M", "I", "L", "E", "G", "H", "I"],
            ["J", "K", "L", "M", "N", "O", "P", "Q"],
            ["R", "S", "T", "U", "V", "W", "X", "Y"],
            ["Z", "A", "B", "C", "D", "E", "F", "G"],
            ["H", "I", "J", "K", "L", "M", "N", "O"],
          ],
        },
      },
      {
        id: "search-4",
        levelNum: 4,
        difficulty: "medium",
        searchData: {
          size: 8,
          words: ["SCHOOL", "FRIEND", "PLANET", "GARDEN"],
          grid: [
            ["S", "C", "H", "O", "O", "L", "X", "Y"],
            ["F", "R", "I", "E", "N", "D", "Z", "A"],
            ["P", "L", "A", "N", "E", "T", "B", "C"],
            ["G", "A", "R", "D", "E", "N", "D", "E"],
            ["F", "G", "H", "I", "J", "K", "L", "M"],
            ["N", "O", "P", "Q", "R", "S", "T", "U"],
            ["V", "W", "X", "Y", "Z", "A", "B", "C"],
            ["D", "E", "F", "G", "H", "I", "J", "K"],
          ],
        },
      },
      {
        id: "search-5",
        levelNum: 5,
        difficulty: "hard",
        searchData: {
          size: 10,
          words: ["RAINBOW", "MONSTER", "DANCING", "ELEPHANT", "PRINCESS"],
          grid: [
            ["R", "A", "I", "N", "B", "O", "W", "X", "Y", "Z"],
            ["M", "O", "N", "S", "T", "E", "R", "A", "B", "C"],
            ["D", "A", "N", "C", "I", "N", "G", "D", "E", "F"],
            ["E", "L", "E", "P", "H", "A", "N", "T", "G", "H"],
            ["P", "R", "I", "N", "C", "E", "S", "S", "I", "J"],
            ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
            ["U", "V", "W", "X", "Y", "Z", "A", "B", "C", "D"],
            ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
            ["O", "P", "Q", "R", "S", "T", "U", "V", "W", "X"],
            ["Y", "Z", "A", "B", "C", "D", "E", "F", "G", "H"],
          ],
        },
      },
    ],
  },
  
  // Zone 5: Word Match (PREMIUM - 25 gems)
  {
    id: "match-mountain",
    name: "Match Mountain",
    emoji: "🏔️",
    gameType: "match",
    description: "Match words to their pictures",
    color: "#E74C3C",
    bgGradient: "from-orange-500 to-red-600",
    unlockCost: 25,
    levels: [
      {
        id: "match-1",
        levelNum: 1,
        difficulty: "easy",
        matchPairs: [
          { word: "CAT", image: "/cat.jpeg" },
          { word: "DOG", image: "/dog.jpeg" },
          { word: "SUN", image: "/sun.jpeg" },
          { word: "BAT", image: "/bat.jpeg" },
        ],
      },
      {
        id: "match-2",
        levelNum: 2,
        difficulty: "easy",
        matchPairs: [
          { word: "FISH", image: "/fish.jpeg" },
          { word: "BIRD", image: "/bird.jpeg" },
          { word: "FROG", image: "/frog.jpeg" },
          { word: "CUP", image: "/cup.jpeg" },
        ],
      },
      {
        id: "match-3",
        levelNum: 3,
        difficulty: "medium",
        matchPairs: [
          { word: "APPLE", image: "/apple.jpeg" },
          { word: "HOUSE", image: "/house.jpeg" },
          { word: "STAR", image: "/star.jpeg" },
          { word: "CAKE", image: "/cake.jpeg" },
          { word: "TRAIN", image: "/train.jpeg" },
        ],
      },
      {
        id: "match-4",
        levelNum: 4,
        difficulty: "medium",
        matchPairs: [
          { word: "SMILE", image: "/smile.jpeg" },
          { word: "MOUSE", image: "/mouse.jpeg" },
          { word: "CAT", image: "/cat.jpeg" },
          { word: "DOG", image: "/dog.jpeg" },
          { word: "FISH", image: "/fish.jpeg" },
          { word: "BIRD", image: "/bird.jpeg" },
        ],
      },
      {
        id: "match-5",
        levelNum: 5,
        difficulty: "hard",
        matchPairs: [
          { word: "APPLE", image: "/apple.jpeg" },
          { word: "HOUSE", image: "/house.jpeg" },
          { word: "STAR", image: "/star.jpeg" },
          { word: "CAKE", image: "/cake.jpeg" },
          { word: "TRAIN", image: "/train.jpeg" },
          { word: "SMILE", image: "/smile.jpeg" },
          { word: "MOUSE", image: "/mouse.jpeg" },
          { word: "SUN", image: "/sun.jpeg" },
        ],
      },
    ],
  },
];

// Helper functions
export function getZoneById(zoneId: string): GameZone | undefined {
  return GAME_ZONES.find(z => z.id === zoneId);
}

export function getLevelById(zoneId: string, levelId: string): ZoneLevel | undefined {
  const zone = getZoneById(zoneId);
  return zone?.levels.find(l => l.id === levelId);
}

export function getNextLevel(zoneId: string, currentLevelId: string): { zone: GameZone; level: ZoneLevel } | null {
  const zone = getZoneById(zoneId);
  if (!zone) return null;
  
  const currentIndex = zone.levels.findIndex(l => l.id === currentLevelId);
  if (currentIndex === -1 || currentIndex >= zone.levels.length - 1) {
    // Try next zone
    const zoneIndex = GAME_ZONES.findIndex(z => z.id === zoneId);
    if (zoneIndex < GAME_ZONES.length - 1) {
      const nextZone = GAME_ZONES[zoneIndex + 1];
      return { zone: nextZone, level: nextZone.levels[0] };
    }
    return null;
  }
  
  return { zone, level: zone.levels[currentIndex + 1] };
}
