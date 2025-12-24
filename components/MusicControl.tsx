"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
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
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] flex items-center gap-3">
      <audio ref={audioRef} src="/music.mp3" loop />
      
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 flex items-center gap-3 order-first"
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
                if (newVol > 0) {
                  setIsMuted(false);
                  if (audioRef.current) audioRef.current.muted = false;
                } else {
                  setIsMuted(true);
                  if (audioRef.current) audioRef.current.muted = true;
                }
              }}
              className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: "#0a33ff",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        onMouseEnter={() => window.innerWidth >= 768 && setShowSlider(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setShowSlider(false)}
        className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center transition-all hover:shadow-xl active:scale-95"
      >
        {isMuted || volume === 0 ? (
          <VolumeX size={20} className="text-gray-400" />
        ) : (
          <Volume2 size={20} className="text-[#0a33ff]" />
        )}
      </button>
    </div>
  );
}
