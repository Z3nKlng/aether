"use client";

import { motion } from "framer-motion";
import { cn } from "../utils";
import { Loader2 } from "lucide-react";

interface NeonButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "default";
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
}

export const NeonButton = ({ 
  children, 
  className, 
  onClick, 
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  ...props 
}: NeonButtonProps) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "rounded-full bg-transparent font-medium transition-all duration-300 relative overflow-hidden group",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "focus-visible:outline-2 focus-visible:outline-neon-blue focus-visible:outline-offset-2",
        variant === "primary" && [
          "px-6 py-2 border border-neon-blue text-neon-blue",
          "shadow-[0_0_15px_rgba(0,174,255,0.3)] hover:shadow-[0_0_25px_rgba(0,174,255,0.5)]",
        ],
        variant === "secondary" && [
          "px-4 py-1.5 border border-white/10 text-neutral-300",
          "hover:border-white/20 hover:text-white",
        ],
        variant === "outline" && [
          "px-4 py-2 border border-white/20 text-neutral-400",
          "hover:border-white/40 hover:text-white",
        ],
        variant === "default" && [
          "px-6 py-2 border border-neon-blue/50 text-neon-blue",
        ],
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base px-8 py-3",
        className
      )}
      aria-disabled={disabled || loading}
      {...props}
    >
      {/* Hover glow effect */}
      <span className={`absolute inset-0 ${variant === "primary" || variant === "default" ? "bg-neon-blue/5" : "bg-white/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} aria-hidden="true" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {children}
      </span>
    </motion.button>
  );
};