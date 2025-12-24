"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, MousePointer2, Volume2, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white overflow-x-hidden relative flex flex-col">
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-10 py-4 lg:py-8 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg lg:text-xl">W</span>
          </div>
          <span className="text-xl lg:text-2xl font-bold tracking-tight text-black">WordMagic</span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/dashboard" className="hidden sm:block">
            <Button variant="ghost" className="font-semibold text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl px-5">
              Log in
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-[#0a33ff] hover:bg-[#0829cc] text-white font-semibold rounded-xl px-6">
              Play Now
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center px-6 lg:px-10 py-12 lg:py-0">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                Learning Made Simple
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] tracking-tight">
                Words Made
                <span className="text-[#0a33ff]"> Fun</span>
              </h1>
              
              <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
                The interactive word adventure where every letter tells a story. Build vocabulary with sounds and colors.
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-start space-y-6 w-full">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white text-lg font-semibold rounded-xl h-14 px-10">
                  Start Playing
                </Button>
              </Link>
              
              <div className="flex items-center gap-5 flex-wrap justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="relative w-9 h-9 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <Image 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                        alt="avatar" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex flex-col">
                  <div className="flex gap-0.5 text-black">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-current" />)}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">10k+ Happy Kids</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <MiniFeature icon={<MousePointer2 size={16} />} text="Drag & Drop" />
              <MiniFeature icon={<Volume2 size={16} />} text="Audio" />
              <MiniFeature icon={<Heart size={16} />} text="Safe" />
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-md bg-gray-50 rounded-3xl border border-gray-200 p-10 flex flex-col items-center gap-8">
              <div className="flex gap-3">
                {['D', 'O', 'G'].map((char, i) => (
                  <div 
                    key={i}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${
                      i === 1 ? 'bg-[#0a33ff] border-[#0a33ff] text-white' : 'bg-white border-gray-200 text-black'
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-black rounded-full" />
                </div>
                <span className="text-xs font-medium text-gray-400">Level 1 in progress</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 lg:px-10 py-6 flex flex-col lg:flex-row items-center justify-between shrink-0 gap-4 border-t border-gray-100">
        <p className="text-gray-400 text-xs font-medium order-2 lg:order-1">© 2025 WordMagic</p>
        <nav className="flex gap-6 order-1 lg:order-2">
          <Link href="/privacy" className="text-gray-400 hover:text-black transition-colors text-xs font-medium">
            Privacy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-black transition-colors text-xs font-medium">
            Terms
          </Link>
          <Link href="/support" className="text-gray-400 hover:text-black transition-colors text-xs font-medium">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function MiniFeature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
      <div className="text-black">{icon}</div>
      <span className="font-medium text-sm text-gray-700">{text}</span>
    </div>
  );
}
