"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  User,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: LayoutDashboard, label: "Game", href: "/dashboard" },
    { icon: Trophy, label: "Achievements", href: "#" },
    { icon: User, label: "Profile", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  const handleLogout = async () => {
    router.push("/");
  };

  return (
    <>
      {/* Desktop Sidebar (unchanged) */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden md:flex flex-col h-full bg-white border-r border-gray-100 relative z-[100] flex-shrink-0"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg z-[110] hover:bg-blue-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg transform rotate-6">
            <span className="text-white font-black text-xl">W</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-gray-800 whitespace-nowrap">
              WORD MAGIC
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="px-4 py-6">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-2xl bg-gray-50/50",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden relative">
              <User size={20} className="text-blue-500" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-700 truncate">Explorer</span>
                <span className="text-xs text-gray-400 truncate">guest@wordmagic.com</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <div
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group",
                  isCollapsed ? "justify-center" : "justify-start",
                  item.href === "/dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <item.icon size={22} className="flex-shrink-0" />
                {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl text-red-400 hover:bg-red-50 transition-all",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut size={22} className="flex-shrink-0" />
            {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[100] flex items-center justify-between px-6">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-gray-800 rounded-full" />
            <span className="w-2/3 h-0.5 bg-gray-800 rounded-full" />
            <span className="w-full h-0.5 bg-gray-800 rounded-full" />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md rotate-6">
            <span className="text-white font-black text-sm">W</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-gray-800">WORD MAGIC</span>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[210] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
                    <span className="text-white font-black text-xl">W</span>
                  </div>
                  <span className="text-xl font-black tracking-tighter text-gray-800">WORD MAGIC</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                    <User size={24} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-gray-800">Explorer</span>
                    <span className="text-xs text-gray-400">guest@wordmagic.com</span>
                  </div>
                </div>
              </div>

              <nav className="flex-grow px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all",
                        item.href === "/dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"
                      )}
                    >
                      <item.icon size={24} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-all"
                >
                  <LogOut size={24} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
