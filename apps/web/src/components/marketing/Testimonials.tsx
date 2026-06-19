"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@aether/ui";

const testimonials = [
  {
    quote: "Aether transformed our engineering speed. We went from ideation to production in 48 hours.",
    author: "Sarah Chen",
    role: "Founder, Stealth Startup",
    avatar: "SC"
  },
  {
    quote: "The autonomous agents handle the boilerplate so I can focus on the product vision. It's like having a 10-person team in my browser.",
    author: "James Wilson",
    role: "Solo Developer",
    avatar: "JW"
  },
  {
    quote: "The security and isolation are top-notch. I trust Aether with our most sensitive internal tools.",
    author: "Elena Rodriguez",
    role: "CTO, Fintech Solutions",
    avatar: "ER"
  }
];

export function Testimonials() {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-20">
        <h2 className="text-4xl font-bold">Trusted by builders worldwide.</h2>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="w-full md:w-[350px]"
          >
            <GlassCard className="h-full flex flex-col justify-between p-8">
              <p className="text-lg text-neutral-300 italic mb-8">&quot;{t.quote}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neon-blue/20 rounded-full flex items-center justify-center font-bold text-neon-blue">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-white">{t.author}</div>
                  <div className="text-xs text-neutral-500 uppercase tracking-widest">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
