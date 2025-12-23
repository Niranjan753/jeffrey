"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all mb-8 shadow-sm border border-gray-100"
        >
          <ChevronLeft size={20} />
          Back Home
        </Link>

        <header className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-blue-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-3">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Last Updated: December 2025</p>
          </div>
        </header>

        <div className="space-y-10">
          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-blue-500 mb-4 uppercase tracking-tight">1. Kids First</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              Word Magic is designed for children. We take privacy very seriously. We do not collect any personal information from children without parental consent.
            </p>
          </section>

          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-purple-500 mb-4 uppercase tracking-tight">2. Information We Collect</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              We only collect information necessary to run the game, such as:
            </p>
            <ul className="mt-4 space-y-3">
              {["Game progress and scores", "Account details (Email/Password)", "Basic usage statistics"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-500 font-bold">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-[2.5rem] border-4 border-gray-50 p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl font-black text-pink-500 mb-4 uppercase tracking-tight">3. Safe Environment</h2>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              We never share or sell user data. There are no third-party advertisements in Word Magic. Your data is encrypted and stored securely.
            </p>
          </section>
        </div>

        <footer className="mt-16 text-center text-gray-400 font-bold py-12 border-t border-gray-50">
          © 2025 WORD MAGIC • SAFE FOR KIDS
        </footer>
      </div>
    </div>
  );
}

