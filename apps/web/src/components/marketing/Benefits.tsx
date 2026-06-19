"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Sparkles } from "lucide-react";
import { GlassCard } from "@aether/ui";

const benefits = [
  {
    title: "10x Faster Development",
    description: "Go from idea to production in minutes, not months. Our agents handle the heavy lifting.",
    icon: Zap,
    color: "text-amber-500"
  },
  {
    title: "Fully Autonomous",
    description: "Agents design, code, test, and deploy. You supervise the high-level vision.",
    icon: Sparkles,
    color: "text-neon-blue"
  },
  {
    title: "Free Forever",
    description: "Build unlimited projects for free. We only charge for high-performance compute.",
    icon: Shield,
    color: "text-green-500"
  }
];

export function Benefits() {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, i) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="h-full p-8 text-center hover:border-white/20 transition-colors group">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center ${benefit.color} group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
              <p className="text-neutral-500 leading-relaxed">{benefit.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
