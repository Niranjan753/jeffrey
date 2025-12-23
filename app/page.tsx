"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Pencil, Trophy, MousePointer2, Volume2, Heart, PlayCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white overflow-x-hidden relative font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-64 lg:w-96 h-64 lg:h-96 bg-pink-100 rounded-full blur-3xl opacity-40" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 -right-20 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40" 
        />
        <motion.div 
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-[-10%] left-1/4 w-64 lg:w-80 h-64 lg:h-80 bg-yellow-100 rounded-full blur-3xl opacity-40" 
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-4 lg:py-6 shrink-0">
        <div className="flex items-center gap-2 lg:gap-3 group cursor-default text-sm lg:text-base">
          <motion.div 
            whileHover={{ rotate: 20, scale: 1.1 }}
            className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 transform rotate-6 transition-all"
          >
            <span className="text-white font-black text-lg lg:text-2xl">W</span>
          </motion.div>
          <span className="text-xl lg:text-3xl font-black tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors uppercase lg:normal-case">WORD MAGIC</span>
        </div>
        <div className="flex gap-2 lg:gap-6 items-center">
          <Link href="/sign-in?demo=true">
            <Button variant="ghost" className="font-black text-blue-500 hover:text-blue-600 hover:bg-blue-50 text-sm lg:text-lg px-2 lg:px-4 hidden sm:flex items-center gap-2">
              <PlayCircle size={18} />
              Try Demo
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" className="font-black text-gray-500 hover:text-blue-600 hover:bg-transparent text-sm lg:text-lg px-2 lg:px-4">Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-blue-500 hover:bg-blue-600 font-black rounded-full px-4 lg:px-8 h-10 lg:h-12 text-sm lg:text-lg shadow-xl shadow-blue-200 hover:-translate-y-1 transition-all">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center px-6 lg:px-10 py-8 lg:py-0">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center text-center lg:text-left">
          
          {/* Left Column: Text Content */}
          <div className="space-y-6 lg:space-y-10">
            <div className="space-y-4 lg:space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 bg-yellow-100 text-yellow-700 rounded-2xl text-[10px] lg:text-sm font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] shadow-sm border border-yellow-200/50"
              >
                <Sparkles size={18} className="animate-pulse" />
                Unlock Their Potential
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="text-5xl lg:text-8xl xl:text-[100px] font-black text-gray-900 leading-[1.1] lg:leading-[0.9] tracking-tight lg:tracking-tighter"
              >
                Words <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-sm">
                  Made Fun!
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg lg:text-2xl text-gray-500 font-bold max-w-xl leading-relaxed mx-auto lg:mx-0"
              >
                The interactive word adventure where every letter tells a story. Boost vocabulary with 
                <span className="text-blue-500"> magic sounds </span> and 
                <span className="text-purple-500"> vibrant colors</span>.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center lg:items-start space-y-6"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-xl lg:text-2xl font-black rounded-[1.5rem] lg:rounded-[2rem] h-16 lg:h-20 px-8 lg:px-12 shadow-2xl shadow-blue-300 border-b-[4px] lg:border-b-[6px] border-blue-800 active:border-b-0 active:translate-y-1.5 transition-all group">
                  START PLAYING!
                  <motion.span 
                    animate={{ x: [0, 5, 0] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2 lg:ml-3 inline-block"
                  >
                    🚀
                  </motion.span>
                </Button>
              </Link>
              
              <div className="flex flex-col items-center lg:flex-row gap-4">
                <div className="flex -space-x-3 lg:-space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                      <Image 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${i + 10}`} 
                        alt="avatar" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                  <span className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">10k+ Happy Kids</span>
                </div>
              </div>
            </motion.div>

            {/* Feature Tags Container */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
              <MiniFeature icon={<MousePointer2 size={16} />} text="Drag & Drop" color="bg-pink-50 text-pink-600" />
              <MiniFeature icon={<Volume2 size={16} />} text="Speech Audio" color="bg-blue-50 text-blue-600" />
              <MiniFeature icon={<Heart size={16} />} text="Safe Design" color="bg-green-50 text-green-600" />
            </div>
          </div>

          {/* Right Column: Hero Visual Container */}
          <div className="hidden lg:flex justify-center relative items-center h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative w-[500px] h-[500px] flex items-center justify-center"
            >
              {/* Central Floating Card */}
              <motion.div 
                animate={{ 
                  y: [-15, 15, -15],
                  rotate: [-3, 3, -3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-80 h-80 bg-white rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-[12px] border-gray-50 flex flex-col items-center justify-center p-8 gap-6"
              >
                <div className="flex gap-3">
                  {['D', 'O', 'G'].map((char, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -10, scale: 1.1 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg ${i === 0 ? 'bg-pink-400' : i === 1 ? 'bg-blue-400' : 'bg-yellow-400'}`}
                    >
                      {char}
                    </motion.div>
                  ))}
        </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-40 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ["0%", "100%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="h-full bg-green-400"
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-nowrap">Level 1 Complete!</span>
                </div>
              </motion.div>
              
              <FloatingIcon icon={<Trophy size={36} />} className="top-0 right-10 bg-gradient-to-br from-yellow-300 to-yellow-500" delay={0} />
              <FloatingIcon icon={<Pencil size={28} />} className="bottom-10 left-0 bg-gradient-to-br from-pink-400 to-pink-600" delay={1} />
              <FloatingIcon icon={<Star size={32} />} className="top-1/4 left-[-20px] bg-gradient-to-br from-blue-400 to-blue-600" delay={2} />
              <FloatingIcon icon={<Sparkles size={28} />} className="bottom-[15%] right-0 bg-gradient-to-br from-purple-400 to-purple-600" delay={1.5} />
              
              <div className="absolute inset-0 z-0">
                <svg className="w-full h-full opacity-10" viewBox="0 0 100 100">
                  <motion.circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="relative z-20 px-6 lg:px-10 py-6 lg:py-8 flex flex-col lg:flex-row items-center justify-between shrink-0 gap-4 mt-auto">
        {/* Navigation Links */}
        <nav className="flex gap-6 lg:gap-8 order-1 lg:order-2" aria-label="Footer navigation">
          <Link href="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors text-[10px] lg:text-sm font-bold uppercase tracking-widest">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-600 transition-colors text-[10px] lg:text-sm font-bold uppercase tracking-widest">
            Terms
          </Link>
          <Link href="/support" className="text-gray-400 hover:text-gray-600 transition-colors text-[10px] lg:text-sm font-bold uppercase tracking-widest">
            Support
          </Link>
        </nav>
        <p className="text-gray-400 text-[10px] lg:text-sm font-bold order-2 lg:order-1">© 2025 WORD MAGIC</p>
      </footer>
    </div>
  );
}

function MiniFeature({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`flex items-center justify-center lg:justify-start gap-2.5 p-2.5 px-4 rounded-xl lg:rounded-2xl ${color} font-black text-[10px] lg:text-xs uppercase tracking-tight lg:tracking-tighter transition-all cursor-default shadow-sm lg:shadow-none`}
    >
      {icon}
      {text}
    </motion.div>
  );
}

function FloatingIcon({ icon, className, delay }: { icon: React.ReactNode, className: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        delay: 0.5 + delay,
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute z-20 w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl flex items-center justify-center text-white ${className}`}
    >
      <div className="scale-75 lg:scale-100">
        {icon}
      </div>
    </motion.div>
  );
}
