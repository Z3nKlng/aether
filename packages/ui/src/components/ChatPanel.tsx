"use client";

import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "./GlassCard";
import { NeonButton } from "./NeonButton";
import { Input } from "./Input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-4 top-20 bottom-4 w-96 z-40"
        >
          <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-blue" />
                <h3 className="font-bold text-sm">Aether AI Sidecar</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm",
                      message.role === "user"
                        ? "bg-neon-blue text-white rounded-tr-none"
                        : message.role === "assistant"
                        ? "glass border border-white/10 text-neutral-200 rounded-tl-none"
                        : "bg-white/5 text-neutral-500 italic text-xs w-full text-center rounded-none border-y border-white/5"
                    )}
                  >
                    {message.content}
                  </div>
                  <span className="text-[10px] text-neutral-600 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Aether to build something..."
                  className="pr-12 bg-black/40 border-white/10 focus:border-neon-blue/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neon-blue text-white rounded-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
