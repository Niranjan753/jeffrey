"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Lightbulb, Check, Sparkles } from "lucide-react";
import { cn, speak } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
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

// Animated input cell
function CrosswordCell({
  cell,
  row,
  col,
  value,
  isSelected,
  isInSelectedWord,
  isCorrect,
  onInput,
  onKeyDown,
  onClick,
  inputRef,
  cellSize,
  fontSize,
}: {
  cell: Cell;
  row: number;
  col: number;
  value: string;
  isSelected: boolean;
  isInSelectedWord: boolean;
  isCorrect: boolean;
  onInput: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
  cellSize: string;
  fontSize: string;
}) {
  const controls = useAnimation();
  const [justTyped, setJustTyped] = useState(false);

  // Letter entry animation
  const handleInput = (newValue: string) => {
    const letter = newValue.toUpperCase().slice(-1);
    if (letter) {
      setJustTyped(true);
      // Play the letter's unique sound - each letter has personality like Endless Reader!
      sounds.letterSound(letter);
      sounds.pop();
      speak(letter.toLowerCase());
      controls.start({
        scale: 1.15,
        transition: { duration: 0.15, ease: "easeOut" },
      }).then(() => {
        controls.start({
          scale: 1,
          transition: { duration: 0.15, ease: "easeOut" },
        });
      });
      setTimeout(() => setJustTyped(false), 300);
    }
    onInput(newValue);
  };

  // Correct answer celebration
  useEffect(() => {
    if (isCorrect && value) {
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
  }, [isCorrect, controls, value]);

  return (
    <motion.div
      animate={controls}
      className={cn(cellSize, "relative")}
    >
      {cell.number && (
        <motion.span 
          className="absolute top-0.5 left-1 text-[9px] font-bold text-gray-400 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (row + col) * 0.02 }}
        >
          {cell.number}
        </motion.span>
      )}
      <motion.input
        ref={inputRef}
        type="text"
        maxLength={1}
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={onKeyDown}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          backgroundColor: isCorrect
            ? "#000000"
            : isSelected 
              ? "#0a33ff" 
              : isInSelectedWord 
                ? "#e5e7eb" 
                : "#ffffff",
        }}
        transition={{ delay: (row + col) * 0.02 }}
        className={cn(
          "w-full h-full text-center font-bold uppercase outline-none transition-all rounded-lg border-2",
          fontSize,
          isSelected
            ? "text-white border-[#0a33ff] ring-2 ring-[#0a33ff]/30"
            : isInSelectedWord
              ? "text-black border-gray-300"
              : "text-black border-gray-200 hover:border-gray-300",
          isCorrect && "text-white border-black",
          justTyped && "ring-2 ring-[#0a33ff]/50"
        )}
      />
    </motion.div>
  );
}

// Animated clue button
function ClueButton({
  clue,
  index,
  isSelected,
  isCompleted,
  onClick,
}: {
  clue: CrosswordClue;
  index: number;
  isSelected: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const handleClick = () => {
    sounds.bubble();
    onClick();
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: clue.direction === "across" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isCompleted ? { scale: 1.02, x: 5 } : {}}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "w-full text-left text-sm p-3 rounded-xl transition-all",
        isCompleted
          ? "bg-gray-100 text-gray-400 line-through"
          : isSelected
            ? "bg-[#0a33ff] text-white shadow-lg"
            : "hover:bg-gray-50 text-gray-600 border border-gray-100"
      )}
    >
      <span className="font-bold mr-2">{index + 1}.</span>
      {clue.clue}
      {isCompleted && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block ml-2"
        >
          <Check className="w-4 h-4 inline" />
        </motion.span>
      )}
    </motion.button>
  );
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
    sounds.bubble();
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
    
    // Check for newly completed words
    const justCompleted = newCompleted.filter(w => !completedWords.includes(w));
    if (justCompleted.length > 0) {
      sounds.success();
      justCompleted.forEach(word => {
        speak(word);
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 }, colors: ["#0a33ff", "#000000"] });
      });
    }
    
    setCompletedWords(newCompleted);

    if (newCompleted.length === clues.length && newCompleted.length > 0) {
      setShowSuccess(true);
      sounds.celebrate();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ["#0a33ff", "#000000", "#FFD700", "#FF6B6B"] });
      setTimeout(() => onComplete(hintsUsed === 0), 2000);
    }
  };

  const revealHint = () => {
    if (!selectedCell) return;
    const correctLetter = grid[selectedCell.row]?.[selectedCell.col]?.letter;
    if (correctLetter) {
      sounds.boing();
      speak(correctLetter.toLowerCase());
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

  const cellSize = gridSize <= 6 ? "w-11 h-11 md:w-12 md:h-12" : "w-9 h-9 md:w-11 md:h-11";
  const fontSize = gridSize <= 6 ? "text-lg md:text-xl" : "text-base md:text-lg";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-gray-100 bg-white">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0a33ff]" />
            Crossword
          </h2>
          <p className="text-sm text-gray-500 font-medium">{completedWords.length}/{clues.length} words</p>
        </div>
        <motion.button
          onClick={revealHint}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full bg-[#0a33ff] text-white hover:bg-[#0829cc] transition-colors shadow-lg"
        >
          <Lightbulb className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2 bg-white">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#0a33ff] to-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedWords.length / clues.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Selected Clue */}
      <AnimatePresence mode="wait">
        {selectedClue && (
          <motion.div
            key={selectedClue.word}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-4 my-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span 
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold text-white",
                  selectedClue.direction === "across" ? "bg-black" : "bg-[#0a33ff]"
                )}
              >
                {selectedClue.direction.toUpperCase()}
              </span>
              {completedWords.includes(selectedClue.word) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-500"
                >
                  <Check className="w-5 h-5" />
                </motion.span>
              )}
            </div>
            <p className="text-gray-700 font-semibold text-lg">{selectedClue.clue}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-grow flex items-center justify-center px-4 overflow-auto py-4">
        <motion.div 
          className="grid gap-1 bg-gray-200 p-2 rounded-2xl shadow-inner"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(cellSize, "relative", cell ? "bg-white rounded-lg" : "bg-gray-700 rounded-lg")}
              >
                {cell && (
                  <CrosswordCell
                    cell={cell}
                    row={rowIndex}
                    col={colIndex}
                    value={userInput[rowIndex]?.[colIndex] || ""}
                    isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                    isInSelectedWord={isInSelectedWord(rowIndex, colIndex)}
                    isCorrect={userInput[rowIndex]?.[colIndex] === cell.letter}
                    onInput={(value) => handleInput(rowIndex, colIndex, value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    inputRef={(el) => {
                      if (!inputRefs.current[rowIndex]) inputRefs.current[rowIndex] = [];
                      inputRefs.current[rowIndex][colIndex] = el;
                    }}
                    cellSize={cellSize}
                    fontSize={fontSize}
                  />
                )}
              </div>
            ))
          )}
        </motion.div>
      </div>

      {/* Clues List */}
      <div className="bg-white border-t border-gray-100 p-4 max-h-[30vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-xs font-bold text-black mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black" />
              Across
            </h3>
            <div className="space-y-2">
              {clues.filter(c => c.direction === "across").map((clue, i) => (
                <ClueButton
                  key={clue.word}
                  clue={clue}
                  index={i}
                  isSelected={selectedClue?.word === clue.word}
                  isCompleted={completedWords.includes(clue.word)}
                  onClick={() => {
                    setSelectedClue(clue);
                    setSelectedCell({ row: clue.row, col: clue.col });
                    inputRefs.current[clue.row]?.[clue.col]?.focus();
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-black mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0a33ff]" />
              Down
            </h3>
            <div className="space-y-2">
              {clues.filter(c => c.direction === "down").map((clue, i) => (
                <ClueButton
                  key={clue.word}
                  clue={clue}
                  index={i}
                  isSelected={selectedClue?.word === clue.word}
                  isCompleted={completedWords.includes(clue.word)}
                  onClick={() => {
                    setSelectedClue(clue);
                    setSelectedCell({ row: clue.row, col: clue.col });
                    inputRefs.current[clue.row]?.[clue.col]?.focus();
                  }}
                />
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
                Complete!
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-500 mt-3"
              >
                {hintsUsed === 0 ? "Perfect puzzle solve! 🧩" : `Great job! ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used`}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
