"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TASKS = [
  "Initializing Aether core...",
  "Spawning Backend Architect agent...",
  "Deploying database schema to Turso...",
  "Optimizing edge functions...",
  "Provisioning sandboxed runtime...",
  "Analyzing codebase for potential refactors...",
  "Generating API documentation...",
  "Executing integration tests...",
  "Shipping to production...",
];

export const FloatingTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLines((prev) => [...prev.slice(-5), `> ${TASKS[index % TASKS.length]}`]);
      index++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: 50 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="glass rounded-lg border border-white/10 p-4 w-72 h-48 font-mono text-[10px] shadow-2xl relative overflow-hidden"
    >
      <div className="flex gap-1.5 mb-2 border-b border-white/5 pb-2">
        <div className="w-2 h-2 rounded-full bg-red-500/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500/50" />
      </div>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="text-neon-blue overflow-hidden whitespace-nowrap">
            {line}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
    </motion.div>
  );
};
