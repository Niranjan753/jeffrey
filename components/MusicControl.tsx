"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
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

  const toggleSlider = () => {
    setShowSlider(!showSlider);
  };

  return (
    <div className="fixed bottom-8 right-8 md:right-8 z-[60] flex items-center gap-3">
      {/* Ensure it's above mobile menu */}
      <audio 
        ref={audioRef}
        src="/music.mp3"
        loop
      />
      
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-white/95 backdrop-blur-md p-3 md:p-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 order-first"
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
              className="w-20 md:w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                WebkitAppearance: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          // On mobile, show slider. On desktop, just toggle mute
          if (window.innerWidth < 768) {
            toggleSlider();
          } else {
            toggleMute();
          }
        }}
        onMouseEnter={() => {
          // Only show on hover for desktop
          if (window.innerWidth >= 768) {
            setShowSlider(true);
          }
        }}
        onMouseLeave={() => {
          // Only hide on mouse leave for desktop
          if (window.innerWidth >= 768) {
            setShowSlider(false);
          }
        }}
        className="rounded-full h-14 w-14 md:h-12 md:w-12 bg-white/95 backdrop-blur-md shadow-2xl border-gray-100 group relative overflow-hidden active:scale-95 transition-all touch-manipulation"
      >
        <AnimatePresence mode="wait">
          {isMuted || volume === 0 ? (
            <motion.div
              key="muted"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
            >
              <VolumeX size={22} className="text-gray-400" />
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ scale: 0, rotate: 45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -45 }}
              className="relative flex items-center justify-center"
            >
              <Volume2 size={22} className="text-blue-500 z-10" />
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

