"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ScrollText } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-yellow-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-green-100 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all mb-8 shadow-sm border border-gray-100"
        >
          <ChevronLeft size={20} />
          Back Home
        </Link>

        <header className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-yellow-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl -rotate-3">
            <ScrollText size={32} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Last Updated: December 2025</p>
          </div>
        </header>

        <div className="space-y-10">
          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-yellow-600 mb-4 uppercase tracking-tight">1. Using Word Magic</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              By playing Word Magic, you agree to follow the rules of the game. Our goal is to provide a fun and safe educational experience for everyone.
            </p>
          </section>

          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-green-600 mb-4 uppercase tracking-tight">2. Account Safety</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              You are responsible for keeping your account password safe. Parents should assist children in setting up and managing their accounts.
            </p>
          </section>

          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-blue-600 mb-4 uppercase tracking-tight">3. Prohibited Content</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              Users must not attempt to disrupt the game, hack our systems, or use the service for any illegal activities. We reserve the right to close accounts that violate these terms.
            </p>
          </section>
        </div>

        <footer className="mt-16 text-center text-gray-400 font-bold py-12 border-t border-gray-50">
          © 2025 WORD MAGIC • PLAY FAIR
        </footer>
      </div>
    </div>
  );
}

