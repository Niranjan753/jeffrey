"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
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
    setCards([...shuffleArray(wordCards), ...shuffleArray(imageCards)]);
  }, [pairs]);

  const handleCardClick = (card: CardData) => {
    if (matchedPairs.includes(card.pairId)) return;
    
    if (selectedCard && selectedCard.type === card.type) {
      setSelectedCard(card);
      return;
    }

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      if (selectedCard.pairId === card.pairId) {
        const newMatched = [...matchedPairs, card.pairId];
        setMatchedPairs(newMatched);
        setLastMatch(card.pairId);
        setSelectedCard(null);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });
        setTimeout(() => setLastMatch(null), 400);

        if (newMatched.length === pairs.length) {
          setShowSuccess(true);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000"] });
          setTimeout(() => onComplete(wrongAttempts === 0), 1500);
        }
      } else {
        setWrongAttempts(prev => prev + 1);
        setShowWrong(true);
        setTimeout(() => {
          setShowWrong(false);
          setSelectedCard(null);
        }, 400);
      }
    }
  };

  const isCardSelected = (card: CardData) => selectedCard?.id === card.id;
  const isCardMatched = (card: CardData) => matchedPairs.includes(card.pairId);
  const isCardJustMatched = (card: CardData) => lastMatch === card.pairId;

  const wordCards = cards.filter(c => c.type === "word");
  const imageCards = cards.filter(c => c.type === "image");

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-black">Word Match</h2>
          <span className="text-sm font-medium text-gray-500">{matchedPairs.length}/{pairs.length}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all" style={{ width: `${(matchedPairs.length / pairs.length) * 100}%` }} />
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-4 py-6 overflow-auto">
        {/* Words */}
        <div className="flex flex-wrap md:flex-col gap-2 justify-center">
          <p className="w-full text-center text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Words</p>
          {wordCards.map((card) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: isCardJustMatched(card) ? [1, 1.05, 1] : 1,
              }}
              transition={{ ease: "easeOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card)}
              disabled={isCardMatched(card)}
              className={cn(
                "px-5 py-3 rounded-xl font-semibold transition-all min-w-[100px]",
                isCardMatched(card)
                  ? "bg-black text-white"
                  : isCardSelected(card)
                    ? "bg-[#0a33ff] text-white"
                    : showWrong && isCardSelected(card)
                      ? "bg-gray-300"
                      : "bg-gray-100 text-black hover:bg-gray-200"
              )}
            >
              {isCardMatched(card) && <Check className="w-4 h-4 inline mr-1" />}
              {card.content}
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-48 bg-gray-200" />
        <div className="md:hidden w-full h-px bg-gray-200" />

        {/* Images */}
        <div className="flex flex-wrap md:flex-col gap-2 justify-center">
          <p className="w-full text-center text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pictures</p>
          {imageCards.map((card) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: isCardJustMatched(card) ? [1, 1.05, 1] : 1,
              }}
              transition={{ ease: "easeOut" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(card)}
              disabled={isCardMatched(card)}
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden transition-all relative border-2",
                isCardMatched(card)
                  ? "border-black"
                  : isCardSelected(card)
                    ? "border-[#0a33ff]"
                    : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image src={card.content} alt="Match" fill className="object-cover" />
              {isCardMatched(card) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center py-3 px-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {selectedCard 
            ? `Tap the matching ${selectedCard.type === "word" ? "picture" : "word"}`
            : "Tap to match words with pictures"}
        </p>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-black">All Matched!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
