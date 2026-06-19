"use client";

import { motion } from "framer-motion";
import { cn } from "../utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  "aria-label"?: string;
}

export const GlassCard = ({ children, className, as: Component = "div", ...props }: GlassCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={cn(
        "glass rounded-2xl p-6 relative overflow-hidden group transition-shadow duration-500 hover:shadow-neon-lg",
        className
      )}
      role="region"
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
      
      {/* Corner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};