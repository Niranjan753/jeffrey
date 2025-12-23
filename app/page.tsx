"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Trophy, MousePointer2, Volume2, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#fbfbfb] overflow-x-hidden relative font-[family-name:var(--font-geist-sans)] flex flex-col">
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-4 lg:py-8 shrink-0">
        <div className="flex items-center gap-3 group cursor-default text-sm lg:text-base">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-blue-600 font-black text-lg lg:text-2xl">W</span>
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 uppercase">WORD MAGIC</span>
        </div>
        <div className="flex gap-2 sm:gap-3 lg:gap-6 items-center">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" className="font-bold text-gray-600 hover:text-blue-600 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all rounded-xl px-4 lg:px-6 text-sm lg:text-base">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 sm:px-6 text-sm lg:text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all">
              Play Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow flex items-center px-6 lg:px-10 py-8 lg:py-0">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-24 items-center">
          
          {/* Left Column: Text Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-12 text-center sm:text-left">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-gray-200">
                <Sparkles size={14} className="text-blue-500" />
                Unlock Their Potential
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-gray-900 leading-[1.1] sm:leading-[1] lg:leading-[0.95] tracking-tight">
                Words <br className="hidden sm:block" />
                <span className="text-blue-600">
                  Made Fun!
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
                The interactive word adventure where every letter tells a story. Boost vocabulary with 
                <span className="text-blue-600 font-bold"> magic sounds </span> and 
                <span className="text-purple-600 font-bold"> vibrant colors</span>.
              </p>
            </div>
            
            <div className="flex flex-col items-center sm:items-start space-y-6 sm:space-y-8 w-full">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg sm:text-xl font-bold rounded-2xl h-14 sm:h-16 px-8 sm:px-10 shadow-[0_8px_30px_rgb(37,99,235,0.4)] border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                  START PLAYING!
                </Button>
              </Link>
              
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-start">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden">
                      <Image 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${i + 10}`} 
                        alt="avatar" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-current" />)}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">10k+ Happy Kids</span>
                </div>
              </div>
            </div>

            {/* Feature Tags Container */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
              <MiniFeature icon={<MousePointer2 size={16} />} text="Drag & Drop" />
              <MiniFeature icon={<Volume2 size={16} />} text="Speech Audio" />
              <MiniFeature icon={<Heart size={16} />} text="Safe Design" />
            </div>
          </div>

          {/* Mobile Hero Visual - Simplified */}
          <div className="lg:hidden flex justify-center items-center w-full my-8">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center gap-6">
              <div className="flex gap-3">
                {['D', 'O', 'G'].map((char, i) => (
                  <div 
                    key={i}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-md border ${
                      i === 0 ? 'bg-pink-50 border-pink-100 text-pink-500' : 
                      i === 1 ? 'bg-blue-50 border-blue-100 text-blue-500' : 
                      'bg-yellow-50 border-yellow-100 text-yellow-500'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-green-500 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level 1 in progress</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Container - Desktop */}
          <div className="hidden lg:flex justify-center relative items-center h-full">
            <div className="relative w-full aspect-square max-w-[500px] bg-white rounded-[40px] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border border-gray-100 p-12 flex items-center justify-center">
              {/* Decorative elements to match "depth" sense */}
              <div className="absolute top-8 left-8 w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center text-blue-500">
                <Sparkles size={24} />
              </div>
              <div className="absolute bottom-8 right-8 w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center text-purple-500">
                <Trophy size={24} />
              </div>

              {/* Central Card */}
              <div className="w-64 h-64 bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col items-center justify-center p-8 gap-8">
                <div className="flex gap-4">
                  {['D', 'O', 'G'].map((char, i) => (
                    <div 
                      key={i}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md border ${
                        i === 0 ? 'bg-pink-50 border-pink-100 text-pink-500' : 
                        i === 1 ? 'bg-blue-50 border-blue-100 text-blue-500' : 
                        'bg-yellow-50 border-yellow-100 text-yellow-500'
                      }`}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level 1 in progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="relative z-20 px-6 lg:px-10 py-10 flex flex-col lg:flex-row items-center justify-between shrink-0 gap-4 mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest order-2 lg:order-1">© 2025 WORD MAGIC</p>
        <nav className="flex gap-8 order-1 lg:order-2">
          <Link href="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold uppercase tracking-widest">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold uppercase tracking-widest">
            Terms
          </Link>
          <Link href="/support" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold uppercase tracking-widest">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function MiniFeature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-default">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <span className="font-bold text-xs sm:text-sm text-gray-700">{text}</span>
    </div>
  );
}
