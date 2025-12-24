"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles, Check, X } from "lucide-react";
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

  // Initialize grid
  useEffect(() => {
    const newGrid: (Cell | null)[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
    
    const newInput: string[][] = Array(gridSize)
      .fill("")
      .map(() => Array(gridSize).fill(""));

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
          
          if (isStart) {
            startPositions.add(posKey);
          }

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
    inputRefs.current = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
  }, [clues, gridSize]);

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row]?.[col]) return;
    
    setSelectedCell({ row, col });
    
    // Find clue for this cell
    const cellWordIds = grid[row][col]?.wordIds || [];
    const clue = clues.find(c => cellWordIds.includes(c.word));
    if (clue) {
      setSelectedClue(clue);
    }

    // Focus input
    inputRefs.current[row]?.[col]?.focus();
  };

  const handleInput = (row: number, col: number, value: string) => {
    const letter = value.toUpperCase().slice(-1);
    
    const newInput = [...userInput];
    newInput[row][col] = letter;
    setUserInput(newInput);

    // Check if any word is complete
    checkWordCompletion(newInput);

    // Move to next cell
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
      const letters = clue.word.split("");
      
      letters.forEach((letter, i) => {
        const row = clue.direction === "across" ? clue.row : clue.row + i;
        const col = clue.direction === "across" ? clue.col + i : clue.col;
        
        if (input[row]?.[col] !== letter) {
          isComplete = false;
        }
      });

      if (isComplete) {
        newCompleted.push(clue.word);
      }
    });

    setCompletedWords(newCompleted);

    // Check if all words are complete
    if (newCompleted.length === clues.length && newCompleted.length > 0) {
      setShowSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
      
      setTimeout(() => {
        onComplete(hintsUsed === 0);
      }, 2000);
    }
  };

  const revealHint = () => {
    if (!selectedClue || !selectedCell) return;
    
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
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-purple-50 via-indigo-50 to-violet-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute top-40 right-10 w-64 h-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-violet-200/30 blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black text-purple-600">🏰 Crossword</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500">
              {completedWords.length}/{clues.length} words
            </span>
            <button
              onClick={revealHint}
              className="p-2 rounded-xl bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-all active:scale-95"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedWords.length / clues.length) * 100}%` }}
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
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-purple-100"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-xs font-black text-white",
                selectedClue.direction === "across" ? "bg-blue-500" : "bg-green-500"
              )}>
                {selectedClue.direction.toUpperCase()}
              </span>
              {completedWords.includes(selectedClue.word) && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-gray-700 font-bold">{selectedClue.clue}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 overflow-auto">
        <div 
          className="grid gap-0.5 bg-gray-300 p-0.5 rounded-xl shadow-xl"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  cellSize,
                  "relative",
                  cell ? "bg-white" : "bg-gray-800"
                )}
              >
                {cell && (
                  <>
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-[8px] md:text-[10px] font-bold text-gray-400">
                        {cell.number}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        if (!inputRefs.current[rowIndex]) {
                          inputRefs.current[rowIndex] = [];
                        }
                        inputRefs.current[rowIndex][colIndex] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={userInput[rowIndex]?.[colIndex] || ""}
                      onChange={(e) => handleInput(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={cn(
                        "w-full h-full text-center font-black uppercase bg-transparent outline-none",
                        fontSize,
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? "bg-purple-200"
                          : isInSelectedWord(rowIndex, colIndex)
                            ? "bg-purple-100"
                            : "",
                        userInput[rowIndex]?.[colIndex] === cell.letter
                          ? "text-green-600"
                          : userInput[rowIndex]?.[colIndex]
                            ? "text-gray-800"
                            : "text-gray-400"
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
      <div className="relative z-10 bg-white/90 backdrop-blur-sm border-t border-gray-100 p-4 max-h-[30vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-sm font-black text-blue-600 mb-2">ACROSS</h3>
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
                    "w-full text-left text-sm p-2 rounded-lg transition-all",
                    completedWords.includes(clue.word)
                      ? "bg-green-100 text-green-700 line-through"
                      : selectedClue?.word === clue.word
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <span className="font-bold">{i + 1}.</span> {clue.clue}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-green-600 mb-2">DOWN</h3>
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
                    "w-full text-left text-sm p-2 rounded-lg transition-all",
                    completedWords.includes(clue.word)
                      ? "bg-green-100 text-green-700 line-through"
                      : selectedClue?.word === clue.word
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  <span className="font-bold">{i + 1}.</span> {clue.clue}
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center"
            >
              <Sparkles className="w-20 h-20 text-purple-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-purple-600">PUZZLE COMPLETE!</h2>
              <p className="text-gray-500 font-bold mt-2">
                {hintsUsed === 0 ? "Perfect solve! 🌟" : `Solved with ${hintsUsed} hints`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

