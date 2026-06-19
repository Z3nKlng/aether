"use client";

import React from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface LiveCursorProps {
  name: string;
  color: string;
  x: number;
  y: number;
}

export const LiveCursor: React.FC<LiveCursorProps> = ({ name, color, x, y }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-50 flex items-start gap-1"
      animate={{ x, y }}
      transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.5 }}
    >
      <MousePointer2 className="w-5 h-5 fill-current" style={{ color }} />
      <div
        className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold text-white whitespace-nowrap shadow-xl"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </motion.div>
  );
};

export const LiveCursorsContainer: React.FC<{ cursors: LiveCursorProps[] }> = ({ cursors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cursors.map((cursor, i) => (
        <LiveCursor key={i} {...cursor} />
      ))}
    </div>
  );
};
