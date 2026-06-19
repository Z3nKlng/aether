"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Cpu, 
  Settings, 
  Menu, 
  X, 
  Calendar,
  ChevronRight,
  Bell
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@aether/ui";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <div className="text-red-500 font-mono text-xs uppercase tracking-[0.2em]">Aether Admin Console</div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: TrendingUp, label: "Executive", href: "/admin/executive" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Cpu, label: "Agents", href: "/admin/agents" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const currentPathLabel = navItems.find(item => item.href === pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-md transition-all duration-300 relative z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex-shrink-0 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <span className="font-bold text-white text-xs">AE</span>
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold tracking-tighter text-xl"
            >
              AETHER
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative",
                pathname === item.href 
                  ? "bg-red-600/10 text-red-500" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
              {pathname === item.href && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-neutral-400">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                <p className="text-xs font-medium truncate">{session.user?.name}</p>
                <p className="text-[10px] text-red-500 font-mono uppercase tracking-widest">Admin</p>
              </motion.div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center text-neutral-400 hover:text-white"
        >
          {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-8 z-40">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500 font-medium">Platform</span>
            <ChevronRight size={14} className="text-neutral-700" />
            <span className="text-neutral-200 font-bold tracking-tight">{currentPathLabel}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 cursor-pointer hover:bg-white/10 transition-colors">
              <Calendar size={14} className="text-red-500" />
              <span className="text-xs font-medium text-neutral-300">Jun 1 — Jun 30, 2026</span>
            </div>
            
            <div className="h-4 w-px bg-white/10" />
            
            <button className="p-2 text-neutral-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-black" />
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/10" />
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex items-center justify-around bg-black/80 backdrop-blur-xl border-t border-white/10 h-16 px-4">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1",
                pathname === item.href ? "text-red-500" : "text-neutral-500"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
