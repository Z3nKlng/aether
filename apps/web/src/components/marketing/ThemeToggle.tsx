"use client";

import { useTheme } from "@/providers/theme-provider";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full glass-hover overflow-hidden"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          y: theme === "dark" ? 0 : 40,
          opacity: theme === "dark" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Moon className="w-5 h-5 text-neon-blue" />
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          y: theme === "light" ? 0 : -40,
          opacity: theme === "light" ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Sun className="w-5 h-5 text-amber-500" />
      </motion.div>
    </button>
  );
}
