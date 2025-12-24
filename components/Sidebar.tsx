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
  Zap,
  Gift
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: Zap, label: "Play", href: "/dashboard" },
    { icon: Gift, label: "Rewards", href: "/rewards" },
    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const handleLogout = async () => {
    router.push("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 240 }}
        className="hidden md:flex flex-col h-full bg-white border-r border-gray-100 relative z-[100] flex-shrink-0"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white z-[110] hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div className="p-5 flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-black rounded-lg flex-shrink-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-black whitespace-nowrap">
              WordMagic
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive 
                      ? "bg-[#0a33ff] text-white" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-black transition-colors cursor-pointer",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 z-[100] flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-600 cursor-pointer"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className="w-full h-0.5 bg-black rounded-full" />
            <span className="w-3 h-0.5 bg-black rounded-full" />
            <span className="w-full h-0.5 bg-black rounded-full" />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-bold text-black">WordMagic</span>
        </div>
        
        <div className="w-8" />
      </div>

      {/* Mobile Drawer */}
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
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[210] md:hidden flex flex-col shadow-xl"
            >
              <div className="p-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <span className="text-lg font-bold text-black">WordMagic</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
              </div>

              <nav className="flex-grow p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-xl transition-colors cursor-pointer",
                          isActive 
                            ? "bg-[#0a33ff] text-white" 
                            : "text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
