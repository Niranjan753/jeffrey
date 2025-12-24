"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  color: string;
}

const COLORS = [
  "bg-pink-400/60",
  "bg-blue-400/60",
  "bg-green-400/60",
  "bg-yellow-400/60",
  "bg-purple-400/60",
  "bg-orange-400/60",
  "bg-teal-400/60",
];

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
    
    // Only allow horizontal, vertical, or diagonal lines
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    if (absRowDiff !== absColDiff && absRowDiff !== 0 && absColDiff !== 0) {
      // Not a valid line
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
    setSelection({
      start: { row, col },
      end: { row, col },
      cells: [{ row, col }],
    });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging || !selection.start) return;
    
    const cells = getCellsInLine(selection.start, { row, col });
    setSelection({
      ...selection,
      end: { row, col },
      cells,
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || selection.cells.length < 2) {
      setIsDragging(false);
      setSelection({ start: null, end: null, cells: [] });
      return;
    }

    const selectedWord = getWordFromCells(selection.cells);
    const reversedWord = getWordFromCells([...selection.cells].reverse());

    // Check if this word is in the list
    const foundWord = data.words.find(
      w => w === selectedWord || w === reversedWord
    );

    if (foundWord && !foundWords.find(f => f.word === foundWord)) {
      const colorIndex = foundWords.length % COLORS.length;
      const newFoundWords = [
        ...foundWords,
        { word: foundWord, cells: selection.cells, color: COLORS[colorIndex] },
      ];
      setFoundWords(newFoundWords);

      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 },
      });

      // Check if all words found
      if (newFoundWords.length === data.words.length) {
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
    } else if (!foundWord) {
      setWrongAttempts(prev => prev + 1);
    }

    setIsDragging(false);
    setSelection({ start: null, end: null, cells: [] });
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selection.cells.some(c => c.row === row && c.col === col);
  };

  const getCellFoundColor = (row: number, col: number): string | null => {
    for (const found of foundWords) {
      if (found.cells.some(c => c.row === row && c.col === col)) {
        return found.color;
      }
    }
    return null;
  };

  const cellSize = data.size <= 6 ? "w-10 h-10 md:w-12 md:h-12" : 
                   data.size <= 8 ? "w-8 h-8 md:w-10 md:h-10" : 
                   "w-7 h-7 md:w-8 md:h-8";
  
  const fontSize = data.size <= 6 ? "text-lg md:text-xl" : 
                   data.size <= 8 ? "text-base md:text-lg" : 
                   "text-sm md:text-base";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-green-200/30 blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-teal-200/30 blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-green-600">🌴 Word Search</h2>
          <span className="text-sm font-bold text-gray-500 bg-white/80 px-3 py-1 rounded-full">
            {foundWords.length}/{data.words.length} found
          </span>
        </div>

        {/* Progress */}
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(foundWords.length / data.words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Words to Find */}
      <div className="relative z-10 px-4 py-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {data.words.map((word, i) => {
            const isFound = foundWords.some(f => f.word === word);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "px-3 py-1.5 rounded-full font-bold text-sm transition-all",
                  isFound
                    ? "bg-green-500 text-white line-through"
                    : "bg-white/80 text-gray-700 border-2 border-gray-200"
                )}
              >
                {isFound && <Check className="w-3 h-3 inline mr-1" />}
                {word}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="relative z-10 flex-grow flex items-center justify-center px-4 overflow-auto select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <div 
          className="grid gap-1 bg-white/90 p-3 rounded-2xl shadow-xl backdrop-blur-sm"
          style={{ gridTemplateColumns: `repeat(${data.size}, minmax(0, 1fr))` }}
        >
          {data.grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const foundColor = getCellFoundColor(rowIndex, colIndex);
              const isSelected = isCellSelected(rowIndex, colIndex);
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (rowIndex + colIndex) * 0.02 }}
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
                  data-cell={`${rowIndex}-${colIndex}`}
                  className={cn(
                    cellSize,
                    "rounded-lg flex items-center justify-center font-black cursor-pointer transition-all",
                    fontSize,
                    foundColor
                      ? `${foundColor} text-white`
                      : isSelected
                        ? "bg-green-400 text-white scale-110"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {letter}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center py-3 px-4">
        <p className="text-sm text-gray-500 font-medium">
          Drag across letters to find hidden words
        </p>
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
              <Sparkles className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-green-600">ALL FOUND!</h2>
              <p className="text-gray-500 font-bold mt-2">
                {wrongAttempts === 0 ? "Perfect search! 🔍" : `Found all ${data.words.length} words!`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

