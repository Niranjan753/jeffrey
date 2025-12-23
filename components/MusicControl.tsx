"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Attempt to play on mount (dashboard entry)
    // Most browsers block autoplay without interaction, 
    // so we handle the first click anywhere on dashboard to start
    const startAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Silent catch for autoplay blocks
        });
      }
    };

    window.addEventListener("click", startAudio, { once: true });
    return () => window.removeEventListener("click", startAudio);
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="fixed bottom-8 right-8 z-[60] flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <audio 
        ref={audioRef}
        src="/music.mp3"
        loop
      />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 order-first"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setVolume(newVol);
                if (newVol > 0) setIsMuted(false);
                else setIsMuted(true);
              }}
              className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="rounded-full h-12 w-12 bg-white/90 backdrop-blur-sm shadow-xl border-gray-100 group relative overflow-hidden active:scale-95 transition-all"
      >
        <AnimatePresence mode="wait">
          {isMuted || volume === 0 ? (
            <motion.div
              key="muted"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
            >
              <VolumeX size={20} className="text-gray-400" />
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              className="relative flex items-center justify-center"
            >
              <Volume2 size={20} className="text-blue-500 z-10" />
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute w-8 h-8 bg-blue-400 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}

