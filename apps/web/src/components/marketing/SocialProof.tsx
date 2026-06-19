"use client";

import { motion } from "framer-motion";

const logos = [
  "NEXT.JS", "VERCEL", "STRIPE", "GITHUB", "OPENAI", "ANTHROPIC", "GOOGLE", "META", "AMAZON"
];

export function SocialProof() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">Trusted by thousands of developers worldwide</p>
      </div>
      <div className="relative flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center whitespace-nowrap"
        >
          {[...logos, ...logos].map((logo, i) => (
            <span key={i} className="text-2xl font-bold text-neutral-700 tracking-tighter hover:text-neutral-400 transition-colors">
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
