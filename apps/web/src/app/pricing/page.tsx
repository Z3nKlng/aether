"use client";

import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ParticleBackground } from "@/components/marketing/ParticleBackground";
import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

const comparison = [
  { feature: "Concurrent Tasks", free: "1", pro: "5", ent: "Unlimited" },
  { feature: "Agent Memory", free: "Standard", pro: "Enhanced", ent: "Dedicated" },
  { feature: "Custom Models", free: false, pro: true, ent: true },
  { feature: "Custom Domains", free: false, pro: "3", ent: "Unlimited" },
  { feature: "Team Collaboration", free: "Up to 3", pro: "Unlimited", ent: "Unlimited" },
  { feature: "API Access", free: false, pro: true, ent: true },
  { feature: "SLA Guarantees", free: false, pro: false, ent: true },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-neon-blue/30 overflow-x-hidden">
      <Header />
      <div className="relative pt-32 pb-20 px-4">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>
        
        <div className="relative z-10">
          <PricingSection />

          <section className="max-w-5xl mx-auto py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Compare Plans</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-6 px-4 text-sm font-bold uppercase tracking-widest text-neutral-500">Feature</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase tracking-widest text-white">Free</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase tracking-widest text-neon-blue">Pro</th>
                    <th className="py-6 px-4 text-sm font-bold uppercase tracking-widest text-white">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item, i) => (
                    <motion.tr 
                      key={item.feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-6 px-4 font-medium">{item.feature}</td>
                      <td className="py-6 px-4 text-neutral-400">
                        {typeof item.free === "boolean" ? (item.free ? <Check className="w-5 h-5 text-green-500" /> : <Minus className="w-5 h-5 opacity-20" />) : item.free}
                      </td>
                      <td className="py-6 px-4 text-neon-blue font-semibold">
                        {typeof item.pro === "boolean" ? (item.pro ? <Check className="w-5 h-5" /> : <Minus className="w-5 h-5 opacity-20" />) : item.pro}
                      </td>
                      <td className="py-6 px-4">
                        {typeof item.ent === "boolean" ? (item.ent ? <Check className="w-5 h-5 text-white" /> : <Minus className="w-5 h-5 opacity-20" />) : item.ent}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
