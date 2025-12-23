"use client";

import { motion } from "framer-motion";
import { ChevronLeft, LifeBuoy, Mail, MessageCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-pink-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all mb-8 shadow-sm border border-gray-100"
        >
          <ChevronLeft size={20} />
          Back Home
        </Link>

        <header className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-pink-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl rotate-6">
            <LifeBuoy size={32} />
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Need Help?</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">We&apos;re here for you and your little explorers</p>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <ContactCard 
            icon={<Mail className="text-blue-500" />} 
            title="Email Support" 
            text="support@wordmagic.com" 
            color="bg-blue-50"
          />
          <ContactCard 
            icon={<MessageCircle className="text-purple-500" />} 
            title="Live Chat" 
            text="Available 9am - 5pm" 
            color="bg-purple-50"
          />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight flex items-center gap-3">
          <HelpCircle className="text-pink-500" />
          Common Questions
        </h2>

        <div className="space-y-6">
          <FAQItem 
            question="Is Word Magic really free?" 
            answer="Yes! All current levels are free to play. We believe learning should be accessible to every child."
          />
          <FAQItem 
            question="What age group is this for?" 
            answer="The game is designed for children aged 4-8, starting with simple 3-letter words and progressing to complex words."
          />
          <FAQItem 
            question="How do I reset my progress?" 
            answer="You can reset your level progress in the Settings menu within your dashboard."
          />
        </div>

        <footer className="mt-16 text-center text-gray-400 font-bold py-12 border-t border-gray-50">
          © 2025 WORD MAGIC • HERE TO HELP
        </footer>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, text, color }: { icon: React.ReactNode, title: string, text: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-8 rounded-[2.5rem] ${color} border-4 border-white shadow-sm flex flex-col items-center text-center`}
    >
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="font-black text-gray-800 text-lg mb-1 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 font-bold">{text}</p>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-white rounded-3xl border-4 border-gray-50 p-6 lg:p-8 hover:border-pink-100 transition-colors">
      <h3 className="text-lg font-black text-gray-800 mb-2">{question}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{answer}</p>
    </div>
  );
}

