export interface WordData {
  id: string;
  word: string;
  hint?: string;
}

export interface LevelData {
  level: number;
  words: WordData[];
  theme: string;
}

export const LEVELS: LevelData[] = [
  {
    level: 1,
    theme: "#FF6B6B",
    words: [
      { id: "1-1", word: "CAT" },
      { id: "1-2", word: "DOG" },
      { id: "1-3", word: "SUN" },
      { id: "1-4", word: "BAT" },
      { id: "1-5", word: "CUP" },
    ],
  },
  {
    level: 2,
    theme: "#4ECDC4",
    words: [
      { id: "2-1", word: "FISH" },
      { id: "2-2", word: "BIRD" },
      { id: "2-3", word: "FROG" },
      { id: "2-4", word: "STAR" },
      { id: "2-5", word: "CAKE" },
    ],
  },
  {
    level: 3,
    theme: "#FFE66D",
    words: [
      { id: "3-1", word: "APPLE" },
      { id: "3-2", word: "SMILE" },
      { id: "3-3", word: "HOUSE" },
      { id: "3-4", word: "MOUSE" },
      { id: "3-5", word: "TRAIN" },
    ],
  },
  {
    level: 4,
    theme: "#FF9F1C",
    words: [
      { id: "4-1", word: "BANANA" },
      { id: "4-2", word: "ORANGE" },
      { id: "4-3", word: "FLOWER" },
      { id: "4-4", word: "GUITAR" },
      { id: "4-5", word: "ROCKET" },
    ],
  },
  {
    level: 5,
    theme: "#457B9D",
    words: [
      { id: "5-1", word: "RAINBOW" },
      { id: "5-2", word: "OCTOPUS" },
      { id: "5-3", word: "POPCORN" },
      { id: "5-4", word: "WHISTLE" },
      { id: "5-5", word: "BICYCLE" },
    ],
  },
  {
    level: 6,
    theme: "#A8DADC",
    words: [
      { id: "6-1", word: "ELEPHANT" },
      { id: "6-2", word: "DINOSAUR" },
      { id: "6-3", word: "MOUNTAIN" },
      { id: "6-4", word: "UMBRELLA" },
      { id: "6-5", word: "COMPUTER" },
    ],
  },
  {
    level: 7,
    theme: "#E63946",
    words: [
      { id: "7-1", word: "BUTTERFLY" },
      { id: "7-2", word: "SPAGHETTI" },
      { id: "7-3", word: "ASTRONAUT" },
      { id: "7-4", word: "ADVENTURE" },
      { id: "7-5", word: "FIREWORKS" },
    ],
  },
  {
    level: 8,
    theme: "#1D3557",
    words: [
      { id: "8-1", word: "CHOCOLATE" },
      { id: "8-2", word: "VEGETABLE" },
      { id: "8-3", word: "WONDERFUL" },
      { id: "8-4", word: "TELEPHONE" },
      { id: "8-5", word: "BEAUTIFUL" },
    ],
  },
  {
    level: 9,
    theme: "#FFC300",
    words: [
      { id: "9-1", word: "STRAWBERRY" },
      { id: "9-2", word: "HELICOPTER" },
      { id: "9-3", word: "LIGHTNING" },
      { id: "9-4", word: "SCAVENGER" },
      { id: "9-5", word: "FRIENDSHIP" },
    ],
  },
  {
    level: 10,
    theme: "#9B59B6",
    words: [
      { id: "10-1", word: "CHIMPANZEE" },
      { id: "10-2", word: "KALEIDOSCOPE" },
      { id: "10-3", word: "REFRIGERATOR" },
      { id: "10-4", word: "THERMOMETER" },
      { id: "10-5", word: "MARSHMALLOW" },
    ],
  },
];

