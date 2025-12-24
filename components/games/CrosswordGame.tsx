"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface CrosswordClue {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

interface CrosswordGameProps {
  clues: CrosswordClue[];
  gridSize: number;
  onComplete: (perfect: boolean) => void;
}

interface Cell {
  letter: string;
  revealed: boolean;
  wordIds: string[];
  isStart: boolean;
  number?: number;
}

export function CrosswordGame({ clues, gridSize, onComplete }: CrosswordGameProps) {
  const [grid, setGrid] = useState<(Cell | null)[][]>([]);
  const [userInput, setUserInput] = useState<string[][]>([]);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    const newGrid: (Cell | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const newInput: string[][] = Array(gridSize).fill("").map(() => Array(gridSize).fill(""));

    let cellNumber = 1;
    const startPositions: Set<string> = new Set();

    clues.forEach((clue) => {
      const letters = clue.word.split("");
      letters.forEach((letter, i) => {
        const row = clue.direction === "across" ? clue.row : clue.row + i;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        
        if (row < gridSize && col < gridSize) {
          const posKey = `${row}-${col}`;
          const isStart = i === 0 && !startPositions.has(posKey);
          if (isStart) startPositions.add(posKey);

          if (!newGrid[row][col]) {
            newGrid[row][col] = {
              letter,
              revealed: false,
              wordIds: [clue.word],
              isStart,
              number: isStart ? cellNumber++ : undefined,
            };
          } else {
            newGrid[row][col]!.wordIds.push(clue.word);
            if (isStart && !newGrid[row][col]!.number) {
              newGrid[row][col]!.number = cellNumber++;
              newGrid[row][col]!.isStart = true;
            }
          }
        }
      });
    });

    setGrid(newGrid);
    setUserInput(newInput);
    inputRefs.current = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  }, [clues, gridSize]);

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row]?.[col]) return;
    setSelectedCell({ row, col });
    const cellWordIds = grid[row][col]?.wordIds || [];
    const clue = clues.find(c => cellWordIds.includes(c.word));
    if (clue) setSelectedClue(clue);
    inputRefs.current[row]?.[col]?.focus();
  };

  const handleInput = (row: number, col: number, value: string) => {
    const letter = value.toUpperCase().slice(-1);
    const newInput = [...userInput];
    newInput[row][col] = letter;
    setUserInput(newInput);
    checkWordCompletion(newInput);

    if (letter && selectedClue) {
      const nextRow = selectedClue.direction === "down" ? row + 1 : row;
      const nextCol = selectedClue.direction === "across" ? col + 1 : col;
      if (grid[nextRow]?.[nextCol]) {
        setSelectedCell({ row: nextRow, col: nextCol });
        inputRefs.current[nextRow]?.[nextCol]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === "Backspace" && !userInput[row][col] && selectedClue) {
      const prevRow = selectedClue.direction === "down" ? row - 1 : row;
      const prevCol = selectedClue.direction === "across" ? col - 1 : col;
      if (grid[prevRow]?.[prevCol]) {
        setSelectedCell({ row: prevRow, col: prevCol });
        inputRefs.current[prevRow]?.[prevCol]?.focus();
      }
    }
  };

  const checkWordCompletion = (input: string[][]) => {
    const newCompleted: string[] = [];
    clues.forEach((clue) => {
      let isComplete = true;
      clue.word.split("").forEach((letter, i) => {
        const row = clue.direction === "across" ? clue.row : clue.row + i;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        if (input[row]?.[col] !== letter) isComplete = false;
      });
      if (isComplete) newCompleted.push(clue.word);
    });
    setCompletedWords(newCompleted);

    if (newCompleted.length === clues.length && newCompleted.length > 0) {
      setShowSuccess(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000"] });
      setTimeout(() => onComplete(hintsUsed === 0), 1500);
    }
  };

  const revealHint = () => {
    if (!selectedCell) return;
    const correctLetter = grid[selectedCell.row]?.[selectedCell.col]?.letter;
    if (correctLetter) {
      const newInput = [...userInput];
      newInput[selectedCell.row][selectedCell.col] = correctLetter;
      setUserInput(newInput);
      setHintsUsed((prev) => prev + 1);
      checkWordCompletion(newInput);
    }
  };

  const isInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedClue) return false;
    for (let i = 0; i < selectedClue.word.length; i++) {
      const checkRow = selectedClue.direction === "across" ? selectedClue.row : selectedClue.row + i;
      const checkCol = selectedClue.direction === "across" ? selectedClue.col + i : selectedClue.col;
      if (row === checkRow && col === checkCol) return true;
    }
    return false;
  };

  const cellSize = gridSize <= 6 ? "w-10 h-10 md:w-12 md:h-12" : "w-8 h-8 md:w-10 md:h-10";
  const fontSize = gridSize <= 6 ? "text-lg md:text-xl" : "text-base md:text-lg";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-black">Crossword</h2>
          <p className="text-sm text-gray-500">{completedWords.length}/{clues.length} words</p>
        </div>
        <button
          onClick={revealHint}
          className="p-3 rounded-full bg-[#0a33ff] text-white hover:bg-[#0829cc] transition-colors"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all" 
            style={{ width: `${(completedWords.length / clues.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Selected Clue */}
      <AnimatePresence mode="wait">
        {selectedClue && (
          <motion.div
            key={selectedClue.word}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mb-4 p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-semibold text-white",
                selectedClue.direction === "across" ? "bg-black" : "bg-[#0a33ff]"
              )}>
                {selectedClue.direction.toUpperCase()}
              </span>
              {completedWords.includes(selectedClue.word) && (
                <Check className="w-4 h-4 text-black" />
              )}
            </div>
            <p className="text-gray-700 font-medium">{selectedClue.clue}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-grow flex items-center justify-center px-4 overflow-auto">
        <div 
          className="grid gap-0.5 bg-gray-200 p-0.5 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(cellSize, "relative", cell ? "bg-white" : "bg-gray-800")}
              >
                {cell && (
                  <>
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-[8px] font-semibold text-gray-400">
                        {cell.number}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        if (!inputRefs.current[rowIndex]) inputRefs.current[rowIndex] = [];
                        inputRefs.current[rowIndex][colIndex] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={userInput[rowIndex]?.[colIndex] || ""}
                      onChange={(e) => handleInput(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={cn(
                        "w-full h-full text-center font-bold uppercase bg-transparent outline-none",
                        fontSize,
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? "bg-[#0a33ff] text-white"
                          : isInSelectedWord(rowIndex, colIndex)
                            ? "bg-gray-100"
                            : "",
                        userInput[rowIndex]?.[colIndex] === cell.letter
                          ? "text-black"
                          : "text-gray-600"
                      )}
                    />
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clues List */}
      <div className="bg-white border-t border-gray-100 p-4 max-h-[30vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-xs font-bold text-black mb-2 uppercase tracking-wide">Across</h3>
            <div className="space-y-1">
              {clues.filter(c => c.direction === "across").map((clue, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedClue(clue);
                    setSelectedCell({ row: clue.row, col: clue.col });
                    inputRefs.current[clue.row]?.[clue.col]?.focus();
                  }}
                  className={cn(
                    "w-full text-left text-sm p-2 rounded-lg transition-colors",
                    completedWords.includes(clue.word)
                      ? "bg-gray-100 text-gray-400 line-through"
                      : selectedClue?.word === clue.word
                        ? "bg-[#0a33ff] text-white"
                        : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <span className="font-semibold">{i + 1}.</span> {clue.clue}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-black mb-2 uppercase tracking-wide">Down</h3>
            <div className="space-y-1">
              {clues.filter(c => c.direction === "down").map((clue, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedClue(clue);
                    setSelectedCell({ row: clue.row, col: clue.col });
                    inputRefs.current[clue.row]?.[clue.col]?.focus();
                  }}
                  className={cn(
                    "w-full text-left text-sm p-2 rounded-lg transition-colors",
                    completedWords.includes(clue.word)
                      ? "bg-gray-100 text-gray-400 line-through"
                      : selectedClue?.word === clue.word
                        ? "bg-[#0a33ff] text-white"
                        : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  <span className="font-semibold">{i + 1}.</span> {clue.clue}
                </button>
              ))}
            </div>
          </div>
        </div>
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
              <h2 className="text-3xl font-bold text-black">Complete!</h2>
              <p className="text-gray-500 mt-1">
                {hintsUsed === 0 ? "Perfect solve" : `${hintsUsed} hints used`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
