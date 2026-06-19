"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@aether/ui";
import { useState, useEffect } from "react";

const commands = [
  { text: "aether create-app 'Saas platform with stripe and auth'", delay: 1000 },
  { text: "Initializing autonomous agents...", delay: 500 },
  { text: "Architect: Designing schema & API routes...", delay: 800 },
  { text: "Engineer: Generating Next.js frontend...", delay: 1200 },
  { text: "Backend: Setting up PostgreSQL & Redis...", delay: 1000 },
  { text: "DevOps: Configuring Docker & CI/CD...", delay: 1500 },
  { text: "Security: Running audit & hardening...", delay: 900 },
  { text: "App deployed to: https://myapp.aether.sh", delay: 500 },
];

export function InteractiveDemo() {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    if (currentLineIndex < commands.length) {
      const line = commands[currentLineIndex];
      let charIndex = 0;
      
      const timer = setInterval(() => {
        if (charIndex < line.text.length) {
          setCurrentText(prev => prev + line.text[charIndex]);
          charIndex++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setVisibleLines(prev => [...prev, currentLineIndex]);
            setCurrentText("");
            setCurrentLineIndex(prev => prev + 1);
          }, line.delay);
        }
      }, 30);

      return () => clearInterval(timer);
    } else {
      // Restart after a while
      const restartTimer = setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIndex(0);
        setCurrentText("");
      }, 5000);
      return () => clearTimeout(restartTimer);
    }
  }, [currentLineIndex]);

  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-4">
      <GlassCard className="p-0 overflow-hidden border-neon-blue/20 bg-black/40 backdrop-blur-2xl">
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-xs font-mono text-neutral-500 mx-auto">aether — terminal</div>
        </div>
        <div className="p-6 font-mono text-sm sm:text-base min-h-[400px] flex flex-col">
          {visibleLines.map((idx) => (
            <div key={idx} className="flex gap-3 mb-2">
              <span className="text-neon-blue opacity-50 select-none">$</span>
              <span className={idx === commands.length - 1 ? "text-green-400 font-bold" : "text-neutral-300"}>
                {commands[idx].text}
              </span>
            </div>
          ))}
          {currentLineIndex < commands.length && (
            <div className="flex gap-3">
              <span className="text-neon-blue opacity-50 select-none">$</span>
              <span className="text-white">
                {currentText}
                <span className="inline-block w-2 h-4 bg-neon-blue ml-1 animate-pulse" />
              </span>
            </div>
          )}
        </div>
      </GlassCard>
      <div className="mt-8 flex justify-center gap-12 text-center overflow-hidden">
        {[
          { label: "Agents Working", value: "12" },
          { label: "Tasks/min", value: "480" },
          { label: "Success Rate", value: "99.9%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-1"
          >
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
