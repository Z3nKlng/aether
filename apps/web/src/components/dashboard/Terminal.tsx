"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export const Terminal = () => {
  const [logs, setLogs] = useState<string[]>([
    "aether@sandbox:~$ pnpm install",
    "Scope: all 16 workspace projects",
    "Lockfile is up to date, resolution step is skipped",
    "Already up to date",
    "aether@sandbox:~$ npx turbo build",
    "• turbo 2.9.14",
    "web:build: cache miss, executing c2933b1c503b30a8",
    "web:build: $ next build",
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = ["Terminal", "Output", "Debug"];
  const [activeTab, setActiveTab] = useState("Terminal");

  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    setHistory(prev => [...prev, cmd]);
    setLogs(prev => [...prev, `aether@sandbox:~$ ${cmd}`]);
    
    // Simulate responses
    if (cmd.startsWith("npm") || cmd.startsWith("pnpm") || cmd.startsWith("yarn")) {
      setTimeout(() => setLogs(prev => [...prev, "✔ Done in 2.3s"]), 800);
    } else if (cmd === "clear") {
      setLogs([]);
      return;
    } else if (cmd === "ls" || cmd === "dir") {
      setTimeout(() => setLogs(prev => [...prev, "apps/  packages/  turbo.json  package.json"]), 300);
    } else {
      setTimeout(() => setLogs(prev => [...prev, `bash: ${cmd}: command not found`]), 500);
    }
    
    setInput("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(history.length - 1, historyIndex + 1);
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-64 border-t border-white/5 bg-[#0A0A0A] flex flex-col">
      {/* Terminal Tabs */}
      <div className="flex gap-0 px-3 text-xs border-b border-white/5 bg-black/30">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 transition-colors duration-150 ${
              activeTab === tab 
                ? "text-white border-b border-neon-blue bg-white/[0.03]" 
                : "text-neutral-500 hover:text-neutral-300"
            }`}
            aria-label={`${tab} tab`}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-xs overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-1">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={log.startsWith("aether@") ? "text-green-400" : "text-neutral-300"}
            >
              {log}
            </motion.div>
          ))}
          
          {/* Input line */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-400 shrink-0">aether@sandbox:~$</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-white caret-neon-blue"
                aria-label="Terminal input"
                spellCheck={false}
                autoComplete="off"
              />
              {/* Blinking cursor indicator when input is empty */}
              {!input && (
                <span className="absolute top-0 left-0 w-2 h-4 bg-white/70 animate-blink pointer-events-none" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};