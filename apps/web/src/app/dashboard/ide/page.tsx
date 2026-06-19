"use client";

import { Editor } from "@/components/dashboard/Editor";
import { Terminal } from "@/components/dashboard/Terminal";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LiveCursorsContainer, Presence } from "@aether/ui";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical, PanelLeft, PanelBottom } from "lucide-react";

export default function DashboardPage() {
  const [cursors, setCursors] = useState([
    { name: "Frontend Agent", color: "#A855F7", x: 450, y: 200 },
    { name: "Sarah Chen", color: "#F97316", x: 800, y: 400 },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Simulate cursor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => prev.map(c => ({
        ...c,
        x: c.x + (Math.random() - 0.5) * 10,
        y: c.y + (Math.random() - 0.5) * 10,
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex h-full min-w-0 relative">
      <LiveCursorsContainer cursors={cursors} />
      
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-neutral-900/80 border border-white/5 rounded-r-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <PanelLeft className="w-3 h-3 text-neutral-500" />
        </motion.div>
      </button>

      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? 256 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden shrink-0"
      >
        {isSidebarOpen && <Sidebar />}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="h-10 border-b border-white/5 flex bg-[#0A0A0A]">
          <div className="px-4 flex items-center gap-2 border-r border-white/5 bg-white/[0.03] text-xs text-white relative">
            <span className="text-blue-400 font-bold">TS</span>
            <span>index.ts</span>
            <button className="ml-2 text-neutral-600 hover:text-white transition-colors" aria-label="Close tab">&times;</button>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-blue" />
          </div>
          <div className="px-4 flex items-center gap-2 border-r border-white/5 text-xs text-neutral-500 hover:bg-white/[0.02] cursor-pointer transition-colors">
            <span className="text-yellow-400">{}</span>
            <span>package.json</span>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 relative">
            <Editor />
          </div>
          
          {/* Terminal Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-4 bg-neutral-900 border border-white/5 rounded-t-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
              aria-label={isTerminalOpen ? "Close terminal" : "Open terminal"}
            >
              <motion.div animate={{ rotate: isTerminalOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <PanelBottom className="w-3 h-3 text-neutral-500" />
              </motion.div>
            </button>
            <motion.div
              animate={{ height: isTerminalOpen ? "auto" : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {isTerminalOpen && <Terminal />}
            </motion.div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between px-3 text-[10px] text-white/90">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <span className="font-bold">main*</span>
            </div>
            <div className="opacity-70">0 errors, 0 warnings</div>
          </div>
          <div className="flex gap-4 opacity-70">
            <span>UTF-8</span>
            <span>TypeScript React</span>
            <span>Prettier</span>
          </div>
        </div>
      </div>
    </div>
  );
}