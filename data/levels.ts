export interface WordData {
  id: string;
  word: string;
  hint?: string;
  image?: string;
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
  {
    level: 4,
    theme: "#FF9F1C",
    words: [
      { id: "4-1", word: "BANANA", image: "/cat.jpeg" },
      { id: "4-2", word: "ORANGE", image: "/cat.jpeg" },
      { id: "4-3", word: "FLOWER", image: "/cat.jpeg" },
      { id: "4-4", word: "GUITAR", image: "/cat.jpeg" },
      { id: "4-5", word: "ROCKET", image: "/cat.jpeg" },
    ],
  },
  {
    level: 5,
    theme: "#457B9D",
    words: [
      { id: "5-1", word: "RAINBOW", image: "/cat.jpeg" },
      { id: "5-2", word: "OCTOPUS", image: "/cat.jpeg" },
      { id: "5-3", word: "POPCORN", image: "/cat.jpeg" },
      { id: "5-4", word: "WHISTLE", image: "/cat.jpeg" },
      { id: "5-5", word: "BICYCLE", image: "/cat.jpeg" },
    ],
  },
  {
    level: 6,
    theme: "#A8DADC",
    words: [
      { id: "6-1", word: "ELEPHANT", image: "/cat.jpeg" },
      { id: "6-2", word: "DINOSAUR", image: "/cat.jpeg" },
      { id: "6-3", word: "MOUNTAIN", image: "/cat.jpeg" },
      { id: "6-4", word: "UMBRELLA", image: "/cat.jpeg" },
      { id: "6-5", word: "COMPUTER", image: "/cat.jpeg" },
    ],
  },
  {
    level: 7,
    theme: "#E63946",
    words: [
      { id: "7-1", word: "BUTTERFLY", image: "/cat.jpeg" },
      { id: "7-2", word: "SPAGHETTI", image: "/cat.jpeg" },
      { id: "7-3", word: "ASTRONAUT", image: "/cat.jpeg" },
      { id: "7-4", word: "ADVENTURE", image: "/cat.jpeg" },
      { id: "7-5", word: "FIREWORKS", image: "/cat.jpeg" },
    ],
  },
  {
    level: 8,
    theme: "#1D3557",
    words: [
      { id: "8-1", word: "CHOCOLATE", image: "/cat.jpeg" },
      { id: "8-2", word: "VEGETABLE", image: "/cat.jpeg" },
      { id: "8-3", word: "WONDERFUL", image: "/cat.jpeg" },
      { id: "8-4", word: "TELEPHONE", image: "/cat.jpeg" },
      { id: "8-5", word: "BEAUTIFUL", image: "/cat.jpeg" },
    ],
  },
  {
    level: 9,
    theme: "#FFC300",
    words: [
      { id: "9-1", word: "STRAWBERRY", image: "/cat.jpeg" },
      { id: "9-2", word: "HELICOPTER", image: "/cat.jpeg" },
      { id: "9-3", word: "LIGHTNING", image: "/cat.jpeg" },
      { id: "9-4", word: "SCAVENGER", image: "/cat.jpeg" },
      { id: "9-5", word: "FRIENDSHIP", image: "/cat.jpeg" },
    ],
  },
  {
    level: 10,
    theme: "#9B59B6",
    words: [
      { id: "10-1", word: "CHIMPANZEE", image: "/cat.jpeg" },
      { id: "10-2", word: "KALEIDOSCOPE", image: "/cat.jpeg" },
      { id: "10-3", word: "REFRIGERATOR", image: "/cat.jpeg" },
      { id: "10-4", word: "THERMOMETER", image: "/cat.jpeg" },
      { id: "10-5", word: "MARSHMALLOW", image: "/cat.jpeg" },
    ],
  },
];
