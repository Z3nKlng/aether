"use client";

import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { LayoutDashboard, Code, Rocket, Users, Cpu, Settings, CreditCard, Menu, X, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { cn, Presence, ChatPanel, Skeleton } from "@aether/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileNavOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();

  // Mock presence data
  const mockUsers = [
    { id: "1", name: "Aether AI", color: "bg-neon-blue" },
    { id: "2", name: "Frontend Agent", color: "bg-purple-500" },
    { id: "3", name: "Sarah Chen", color: "bg-orange-500" },
    { id: "4", name: "Alex Rivet", color: "bg-pink-500" },
  ];

  // Mock messages
  const [messages, setMessages] = useState([
    { id: "1", role: "system" as const, content: "Aether workforce initialized.", timestamp: new Date() },
    { id: "2", role: "assistant" as const, content: "I've analyzed your repo. Ready to start building the authentication flow.", timestamp: new Date() },
  ]);

  const handleSendMessage = (content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user" as const, content, timestamp: new Date() }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "Understood. I'm starting on that now.", timestamp: new Date() }]);
    }, 1000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" role="status" aria-label="Loading">
        <div className="space-y-6 w-full max-w-md px-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-neon-blue rounded-lg animate-pulse-glow" />
            <div className="text-white font-bold text-xl tracking-tighter">AETHER</div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <p className="text-center text-neutral-500 text-sm animate-pulse">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Code, label: "Browser IDE", href: "/dashboard/ide" },
    { icon: Rocket, label: "Projects", href: "/dashboard/projects" },
    { icon: Cpu, label: "Agents", href: "/dashboard/agents" },
    { icon: Users, label: "Team", href: "/dashboard/team" },
    { icon: CreditCard, label: "Billing", href: "/dashboard/settings/billing" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const isIDERoute = pathname === "/dashboard/ide";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row overflow-hidden">
      <CommandPalette />
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-neon-blue rounded shadow-[0_0_10px_rgba(0,174,255,0.5)]" />
          <span className="font-bold text-lg tracking-tighter">AETHER</span>
        </div>
        <button onClick={() => setIsMobileNavOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 border-r border-white/5 p-6 flex-col gap-8 h-screen sticky top-0 bg-black/50 backdrop-blur-xl" aria-label="Main navigation">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-blue rounded-lg shadow-[0_0_15px_rgba(0,174,255,0.5)] animate-pulse-glow" />
          <span className="font-bold text-xl tracking-tighter">AETHER</span>
        </div>

        <nav className="flex-1 space-y-1" role="navigation" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                pathname === item.href 
                  ? "bg-neon-blue/10 text-white border border-neon-blue/20 shadow-[0_0_20px_rgba(0,174,255,0.05)]" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors duration-200",
                pathname === item.href ? "text-neon-blue" : "group-hover:text-neon-blue"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border border-white/10 flex items-center justify-center text-sm font-bold text-neutral-400" aria-hidden="true">
              {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{session.user?.name || "User"}</span>
              <span className="text-[10px] text-neon-blue uppercase font-mono tracking-wider">Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black/95 md:hidden p-6 pt-20 flex flex-col gap-8 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <nav className="flex-1 space-y-2" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl text-lg transition-all duration-200",
                    pathname === item.href 
                      ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" 
                      : "text-neutral-400 active:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Dashboard Header */}
        <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-sm text-neutral-400">
              {navItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <Presence users={mockUsers} />
            <div className="h-4 w-[1px] bg-white/10" aria-hidden="true" />
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200 relative",
                isChatOpen 
                  ? "bg-neon-blue text-white shadow-[0_0_15px_rgba(0,174,255,0.3)]" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
              aria-label={isChatOpen ? "Close chat panel" : "Open chat panel"}
              aria-expanded={isChatOpen}
            >
              <MessageSquare className="w-5 h-5" />
              {!isChatOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-blue rounded-full animate-pulse" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <main className={cn(
          "flex-1 overflow-y-auto relative",
          isIDERoute ? "p-0" : "p-4 md:p-8"
        )}
        id="main-content"
        role="main"
        >
          <div className={cn(
            "h-full",
            !isIDERoute && "max-w-6xl mx-auto"
          )}>
            {children}
          </div>
        </main>
      </div>

      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}