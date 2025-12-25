"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Check, Sparkles, Search } from "lucide-react";
import { cn, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import confetti from "canvas-confetti";

interface SearchGridData {
  grid: string[][];
  words: string[];
  size: number;
}

interface WordSearchGameProps {
  data: SearchGridData;
  onComplete: (perfect: boolean) => void;
}

interface Selection {
  start: { row: number; col: number } | null;
  end: { row: number; col: number } | null;
  cells: { row: number; col: number }[];
}

interface FoundWord {
  word: string;
  cells: { row: number; col: number }[];
}

// Individual grid cell with wiggle animation
function GridCell({
  letter,
  row,
  col,
  isSelected,
  isFound,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
  onTouchMove,
  cellSize,
  fontSize,
  delay,
}: {
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFound: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onTouchStart: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
  cellSize: string;
  fontSize: string;
  delay: number;
}) {
  const controls = useAnimation();

  // Initial entrance animation
  useEffect(() => {
    controls.start({
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.3,
        delay: delay * 0.3,
        ease: "easeOut",
      },
    });
  }, [controls, delay]);

  // Found animation
  useEffect(() => {
    if (isFound) {
      controls.start({
        scale: 1.1,
        transition: { duration: 0.3, ease: "easeOut" },
      }).then(() => {
        controls.start({
          scale: 1,
          transition: { duration: 0.2, ease: "easeOut" },
        });
      });
    }
  }, [isFound, controls]);

  const handleMouseDown = () => {
    // Play the letter's unique sound - each letter has personality like Endless Reader!
    sounds.letterSound(letter);
    sounds.pop();
    onMouseDown();
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -10 }}
      animate={controls}
      whileHover={!isFound && !isSelected ? { 
        scale: 1.08,
        transition: { duration: 0.15 }
      } : {}}
      onMouseDown={handleMouseDown}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      data-cell={`${row}-${col}`}
      className={cn(
        cellSize,
        "rounded-xl flex items-center justify-center font-bold cursor-pointer transition-all select-none relative overflow-hidden",
        fontSize,
        isFound
          ? "bg-black text-white shadow-lg"
          : isSelected
            ? "bg-[#0a33ff] text-white shadow-lg ring-2 ring-[#0a33ff]/50"
            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-[#0a33ff]"
      )}
    >
      {/* Shine effect for found letters */}
      {isFound && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      
      <motion.span
        className="relative z-10"
        animate={!isFound && !isSelected ? { y: [-0.5, 0.5] } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          delay: delay,
          ease: "easeInOut",
        }}
      >
        {letter}
      </motion.span>
    </motion.div>
  );
}

// Word chip with animation
function WordChip({
  word,
  isFound,
  index,
}: {
  word: string;
  isFound: boolean;
  index: number;
}) {
  const controls = useAnimation();

  // Initial entrance animation
  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: index * 0.05, duration: 0.3, ease: "easeOut" },
    });
  }, [controls, index]);

  // Found animation
  useEffect(() => {
    if (isFound) {
      controls.start({
        scale: 1.08,
        transition: { duration: 0.2, ease: "easeOut" },
      }).then(() => {
        controls.start({
          scale: 1,
          transition: { duration: 0.15, ease: "easeOut" },
        });
      });
    }
  }, [isFound, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={controls}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5",
        isFound
          ? "bg-black text-white shadow-md"
          : "bg-gray-100 text-gray-600"
      )}
    >
      {isFound && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Check className="w-4 h-4" />
        </motion.span>
      )}
      <span>{word}</span>
    </motion.div>
  );
}

export function WordSearchGame({ data, onComplete }: WordSearchGameProps) {
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [selection, setSelection] = useState<Selection>({ start: null, end: null, cells: [] });
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const getCellsInLine = (
    start: { row: number; col: number },
    end: { row: number; col: number }
  ): { row: number; col: number }[] => {
    const cells: { row: number; col: number }[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    if (absRowDiff !== absColDiff && absRowDiff !== 0 && absColDiff !== 0) {
      return [start];
    }
    
    const steps = Math.max(absRowDiff, absColDiff);
    const rowStep = steps === 0 ? 0 : rowDiff / steps;
    const colStep = steps === 0 ? 0 : colDiff / steps;
    
    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + Math.round(rowStep * i),
        col: start.col + Math.round(colStep * i),
      });
    }
    return cells;
  };

  const getWordFromCells = (cells: { row: number; col: number }[]): string => {
    return cells.map(c => data.grid[c.row]?.[c.col] || "").join("");
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    setSelection({ start: { row, col }, end: { row, col }, cells: [{ row, col }] });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || !selection.start) return;
    const cells = getCellsInLine(selection.start, { row, col });
    setSelection({ ...selection, end: { row, col }, cells });
    
    // Play subtle sound as you drag
    if (cells.length > selection.cells.length) {
      sounds.bubble();
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || selection.cells.length < 2) {
      setIsDragging(false);
      setSelection({ start: null, end: null, cells: [] });
      return;
    }

    const selectedWord = getWordFromCells(selection.cells);
    const reversedWord = getWordFromCells([...selection.cells].reverse());
    const foundWord = data.words.find(w => w === selectedWord || w === reversedWord);

    if (foundWord && !foundWords.find(f => f.word === foundWord)) {
      const newFoundWords = [...foundWords, { word: foundWord, cells: selection.cells }];
      setFoundWords(newFoundWords);
      sounds.success();
      speak(foundWord);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000", "#FFD700"] });

      if (newFoundWords.length === data.words.length) {
        setShowSuccess(true);
        sounds.celebrate();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000", "#FFD700", "#FF6B6B"] });
        setTimeout(() => onComplete(wrongAttempts === 0), 2000);
      }
    } else if (!foundWord) {
      setWrongAttempts(prev => prev + 1);
      sounds.wrong();
    }

    setIsDragging(false);
    setSelection({ start: null, end: null, cells: [] });
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selection.cells.some(c => c.row === row && c.col === col);
  };

  const isCellFound = (row: number, col: number): boolean => {
    return foundWords.some(f => f.cells.some(c => c.row === row && c.col === col));
  };

  const cellSize = data.size <= 6 ? "w-11 h-11 md:w-12 md:h-12" : 
                   data.size <= 8 ? "w-9 h-9 md:w-11 md:h-11" : 
                   "w-8 h-8 md:w-9 md:h-9";
  
  const fontSize = data.size <= 6 ? "text-lg md:text-xl" : 
                   data.size <= 8 ? "text-base md:text-lg" : 
                   "text-sm md:text-base";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
            <Search className="w-6 h-6 text-[#0a33ff]" />
            Word Search
          </h2>
          <motion.span 
            className="text-sm font-bold px-4 py-2 bg-gray-100 rounded-full"
            key={foundWords.length}
            initial={{ scale: 1 }}
            animate={{ scale: foundWords.length > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {foundWords.length}/{data.words.length}
          </motion.span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#0a33ff] to-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(foundWords.length / data.words.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Words to Find */}
      <div className="px-4 py-4 border-b border-gray-100 bg-white">
        <motion.div 
          className="flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {data.words.map((word, i) => (
            <WordChip
              key={word}
              word={word}
              isFound={foundWords.some(f => f.word === word)}
              index={i}
            />
          ))}
        </motion.div>
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="flex-grow flex items-center justify-center px-4 overflow-auto select-none py-4"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <motion.div 
          className="grid gap-1.5 bg-gray-100 p-4 rounded-2xl shadow-inner"
          style={{ gridTemplateColumns: `repeat(${data.size}, minmax(0, 1fr))` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {data.grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <GridCell
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                row={rowIndex}
                col={colIndex}
                isSelected={isCellSelected(rowIndex, colIndex)}
                isFound={isCellFound(rowIndex, colIndex)}
                onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                onTouchStart={() => handleCellMouseDown(rowIndex, colIndex)}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  const cellData = element?.getAttribute("data-cell");
                  if (cellData) {
                    const [r, c] = cellData.split("-").map(Number);
                    handleCellMouseEnter(r, c);
                  }
                }}
                cellSize={cellSize}
                fontSize={fontSize}
                delay={(rowIndex + colIndex) * 0.05}
              />
            ))
          )}
        </motion.div>
      </div>

      {/* Instructions */}
      <motion.div 
        className="text-center py-4 px-4 border-t border-gray-100 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0a33ff]" />
          Drag across letters to find words!
          <Sparkles className="w-4 h-4 text-[#0a33ff]" />
        </p>
      </motion.div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-bold text-black">
                All Found!
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-500 mt-3"
              >
                You're a word detective! 🔍
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
