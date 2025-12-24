"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X } from "lucide-react";
import { cn, shuffleArray } from "@/lib/utils";
import confetti from "canvas-confetti";
import Image from "next/image";

interface MatchPair {
  word: string;
  image: string;
}

interface MatchGameProps {
  pairs: MatchPair[];
  onComplete: (perfect: boolean) => void;
}

interface CardData {
  id: string;
  type: "word" | "image";
  content: string;
  pairId: string;
}

export function MatchGame({ pairs, onComplete }: MatchGameProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showWrong, setShowWrong] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  useEffect(() => {
    // Create shuffled cards from pairs
    const wordCards: CardData[] = pairs.map((pair, i) => ({
      id: `word-${i}`,
      type: "word",
      content: pair.word,
      pairId: `pair-${i}`,
    }));

    const imageCards: CardData[] = pairs.map((pair, i) => ({
      id: `image-${i}`,
      type: "image",
      content: pair.image,
      pairId: `pair-${i}`,
    }));

    // Shuffle both sets
    setCards([...shuffleArray(wordCards), ...shuffleArray(imageCards)]);
  }, [pairs]);

  const handleCardClick = (card: CardData) => {
    // Don't select already matched cards
    if (matchedPairs.includes(card.pairId)) return;
    
    // Don't select the same card type as already selected
    if (selectedCard && selectedCard.type === card.type) {
      setSelectedCard(card);
      return;
    }

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      // Check for match
      if (selectedCard.pairId === card.pairId) {
        // Match!
        const newMatched = [...matchedPairs, card.pairId];
        setMatchedPairs(newMatched);
        setLastMatch(card.pairId);
        setSelectedCard(null);

        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });

        setTimeout(() => setLastMatch(null), 500);

        // Check if all matched
        if (newMatched.length === pairs.length) {
          setShowSuccess(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
          });
          setTimeout(() => {
            onComplete(wrongAttempts === 0);
          }, 2000);
        }
      } else {
        // Wrong match
        setWrongAttempts(prev => prev + 1);
        setShowWrong(true);
        setTimeout(() => {
          setShowWrong(false);
          setSelectedCard(null);
        }, 500);
      }
    }
  };

  const isCardSelected = (card: CardData) => selectedCard?.id === card.id;
  const isCardMatched = (card: CardData) => matchedPairs.includes(card.pairId);
  const isCardJustMatched = (card: CardData) => lastMatch === card.pairId;

  const wordCards = cards.filter(c => c.type === "word");
  const imageCards = cards.filter(c => c.type === "image");

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-pink-200/30 blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-orange-600">🏔️ Word Match</h2>
          <span className="text-sm font-bold text-gray-500 bg-white/80 px-3 py-1 rounded-full">
            {matchedPairs.length}/{pairs.length} matched
          </span>
        </div>

        {/* Progress */}
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${(matchedPairs.length / pairs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 flex-grow flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4 py-4 overflow-auto">
        {/* Words Column */}
        <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 justify-center">
          <h3 className="w-full text-center text-sm font-black text-gray-500 mb-1">WORDS</h3>
          {wordCards.map((card) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: isCardJustMatched(card) ? [1, 1.1, 1] : 1,
              }}
              whileHover={!isCardMatched(card) ? { scale: 1.05 } : {}}
              whileTap={!isCardMatched(card) ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card)}
              disabled={isCardMatched(card)}
              className={cn(
                "px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg transition-all shadow-lg min-w-[80px] md:min-w-[120px]",
                isCardMatched(card)
                  ? "bg-green-100 text-green-600 border-2 border-green-300"
                  : isCardSelected(card)
                    ? "bg-orange-500 text-white ring-4 ring-orange-200"
                    : showWrong && isCardSelected(card)
                      ? "bg-red-500 text-white animate-shake"
                      : "bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200"
              )}
            >
              {isCardMatched(card) && <Check className="w-4 h-4 inline mr-1" />}
              {card.content}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-64 bg-gray-200" />
        <div className="md:hidden w-full h-px bg-gray-200" />

        {/* Images Column */}
        <div className="flex flex-wrap md:flex-col gap-2 md:gap-3 justify-center">
          <h3 className="w-full text-center text-sm font-black text-gray-500 mb-1">PICTURES</h3>
          {imageCards.map((card) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: isCardJustMatched(card) ? [1, 1.1, 1] : 1,
              }}
              whileHover={!isCardMatched(card) ? { scale: 1.05 } : {}}
              whileTap={!isCardMatched(card) ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card)}
              disabled={isCardMatched(card)}
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden transition-all shadow-lg relative",
                isCardMatched(card)
                  ? "ring-4 ring-green-400"
                  : isCardSelected(card)
                    ? "ring-4 ring-orange-400"
                    : showWrong && isCardSelected(card)
                      ? "ring-4 ring-red-500 animate-shake"
                      : "ring-2 ring-gray-200 hover:ring-orange-300"
              )}
            >
              <Image
                src={card.content}
                alt="Match image"
                fill
                className="object-cover"
              />
              {isCardMatched(card) && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center py-3 px-4 bg-white/50 backdrop-blur-sm">
        <p className="text-sm text-gray-500 font-medium">
          {selectedCard 
            ? `Now tap the matching ${selectedCard.type === "word" ? "picture" : "word"}!`
            : "Tap a word or picture to start matching"}
        </p>
        {wrongAttempts > 0 && (
          <p className="text-xs text-red-500 font-bold mt-1">
            {wrongAttempts} wrong attempt{wrongAttempts > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
            >
              <Sparkles className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-orange-600">ALL MATCHED!</h2>
              <p className="text-gray-500 font-bold mt-2">
                {wrongAttempts === 0 ? "Perfect matching! 🎯" : `Matched all ${pairs.length} pairs!`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

