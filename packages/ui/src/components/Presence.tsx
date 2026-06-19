"use client";

import React from "react";
import { cn } from "../utils";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
  image?: string;
  color: string;
}

interface PresenceProps {
  users: User[];
  className?: string;
}

export const Presence: React.FC<PresenceProps> = ({ users, className }) => {
  const visibleUsers = users.slice(0, 3);
  const remainingCount = users.length - visibleUsers.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      <AnimatePresence mode="popLayout">
        {visibleUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            className="relative"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white overflow-hidden",
                user.color
              )}
              title={user.name}
            >
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
          </motion.div>
        ))}
      </AnimatePresence>
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 z-0">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
