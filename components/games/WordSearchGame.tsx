"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
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
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });

      if (newFoundWords.length === data.words.length) {
        setShowSuccess(true);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000"] });
        setTimeout(() => onComplete(wrongAttempts === 0), 1500);
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

  const isCellFound = (row: number, col: number): boolean => {
    return foundWords.some(f => f.cells.some(c => c.row === row && c.col === col));
  };

  const cellSize = data.size <= 6 ? "w-10 h-10 md:w-11 md:h-11" : 
                   data.size <= 8 ? "w-8 h-8 md:w-10 md:h-10" : 
                   "w-7 h-7 md:w-8 md:h-8";
  
  const fontSize = data.size <= 6 ? "text-base md:text-lg" : 
                   data.size <= 8 ? "text-sm md:text-base" : 
                   "text-xs md:text-sm";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-black">Word Search</h2>
          <span className="text-sm font-medium text-gray-500">{foundWords.length}/{data.words.length}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all" style={{ width: `${(foundWords.length / data.words.length) * 100}%` }} />
        </div>
      </div>

      {/* Words to Find */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 justify-center">
          {data.words.map((word, i) => {
            const isFound = foundWords.some(f => f.word === word);
            return (
              <div
                key={i}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isFound
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                {isFound && <Check className="w-3 h-3 inline mr-1" />}
                {word}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="flex-grow flex items-center justify-center px-4 overflow-auto select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <div 
          className="grid gap-1 bg-gray-50 p-3 rounded-xl"
          style={{ gridTemplateColumns: `repeat(${data.size}, minmax(0, 1fr))` }}
        >
          {data.grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const found = isCellFound(rowIndex, colIndex);
              const selected = isCellSelected(rowIndex, colIndex);
              
              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (rowIndex + colIndex) * 0.01 }}
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
                    "rounded-lg flex items-center justify-center font-semibold cursor-pointer transition-all",
                    fontSize,
                    found
                      ? "bg-black text-white"
                      : selected
                        ? "bg-[#0a33ff] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
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
      <div className="text-center py-3 px-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">Drag to select words</p>
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
              <h2 className="text-3xl font-bold text-black">All Found!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
