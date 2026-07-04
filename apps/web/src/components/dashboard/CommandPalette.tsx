"use client";

import React, { useEffect, useState, useRef } from "react";
import { Command } from "cmdk";
import { useIDEStore } from "@/store/use-ide-store";
import { 
  Search, 
  File, 
  Settings, 
  Cpu, 
  Rocket, 
  Terminal as TerminalIcon,
  Search as SearchIcon,
  Play,
  Users,
  CreditCard,
  Code,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.02, type: "spring" as const, damping: 25, stiffness: 200 },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.1 },
  },
};

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleCommandPalette, openFile } = useIDEStore();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommandPalette]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    setCommandPaletteOpen(false);
  };

  const navItems = [
    { icon: Rocket, label: "Go to Overview", action: () => navigate("/dashboard") },
    { icon: Code, label: "Open Browser IDE", action: () => navigate("/dashboard/ide") },
    { icon: Rocket, label: "View Projects", action: () => navigate("/dashboard/projects") },
    { icon: Cpu, label: "Manage AI Agents", action: () => navigate("/dashboard/agents") },
    { icon: Users, label: "Team Members", action: () => navigate("/dashboard/team") },
    { icon: CreditCard, label: "Billing & Plans", action: () => navigate("/dashboard/settings/billing") },
    { icon: Settings, label: "System Settings", action: () => navigate("/dashboard/settings") },
  ];

  const recentFiles = [
    { icon: File, label: "index.ts", action: () => { openFile("index.ts"); setCommandPaletteOpen(false); } },
    { icon: File, label: "package.json", action: () => { openFile("package.json"); setCommandPaletteOpen(false); } },
    { icon: File, label: "tailwind.config.js", action: () => { openFile("tailwind.config.js"); setCommandPaletteOpen(false); } },
  ];

  const aiCommands = [
    { icon: Play, label: "Deploy Project", action: () => {} },
    { icon: TerminalIcon, label: "Run Test Suite", action: () => {} },
    { icon: Search, label: "AI Code Audit", action: () => {} },
  ];

  const hasResults = search.length === 0 || 
    [...navItems, ...recentFiles, ...aiCommands].some(item =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm px-4"
        onClick={() => setCommandPaletteOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="flex flex-col h-full">
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <SearchIcon className="w-5 h-5 text-neutral-500 mr-3" />
              <Command.Input
                ref={inputRef}
                autoFocus
                placeholder="Search files, agents, or commands..."
                value={search}
                onValueChange={setSearch}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 text-lg"
                aria-label="Search commands"
              />
              <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-neutral-400 opacity-100">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto hide-scrollbar p-2">
              <Command.Empty className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-neutral-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400 font-medium">No results found</p>
                  <p className="text-neutral-600 text-xs">Try a different search term</p>
                </div>
              </Command.Empty>

              <Command.Group heading="Navigation" className="px-2 py-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                {navItems.map((item, i) => (
                  <Item key={item.label} icon={item.icon} label={item.label} onSelect={item.action} index={i} />
                ))}
              </Command.Group>

              <Command.Group heading="Recent Files" className="px-2 py-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-2">
                {recentFiles.map((item, i) => (
                  <Item key={item.label} icon={item.icon} label={item.label} onSelect={item.action} index={i + navItems.length} />
                ))}
              </Command.Group>

              <Command.Group heading="AI Commands" className="px-2 py-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-2">
                {aiCommands.map((item, i) => (
                  <Item key={item.label} icon={item.icon} label={item.label} onSelect={item.action} index={i + navItems.length + recentFiles.length} />
                ))}
              </Command.Group>
            </Command.List>

            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
              <div className="flex gap-4">
                <span><kbd className="rounded border border-white/10 bg-white/5 px-1 mr-1">↑↓</kbd> to navigate</span>
                <span><kbd className="rounded border border-white/10 bg-white/5 px-1 mr-1">Enter</kbd> to select</span>
              </div>
              <span>Aether OS v0.1.0</span>
            </div>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Item = ({ icon: Icon, label, onSelect, index }: { icon: LucideIcon; label: string; onSelect: () => void; index: number }) => {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <Command.Item
        onSelect={onSelect}
        className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors duration-150 aria-selected:bg-white/10 group"
      >
        <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center group-aria-selected:border-neon-blue/30 group-aria-selected:bg-neon-blue/10 transition-all duration-200">
          <Icon className="w-4 h-4 text-neutral-400 group-aria-selected:text-neon-blue transition-colors duration-200" />
        </div>
        <span className="text-sm font-medium text-neutral-300 group-aria-selected:text-white transition-colors duration-200">{label}</span>
      </Command.Item>
    </motion.div>
  );
};