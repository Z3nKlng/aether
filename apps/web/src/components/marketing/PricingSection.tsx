"use client";

import { NeonButton, GlassCard } from "@aether/ui";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: { monthly: "0", yearly: "0" },
    description: "Perfect for indie hackers and solo devs.",
    features: [
      "Unlimited Projects",
      "Community Agents",
      "Standard Compute",
      "Public Repo Integration",
      "Vercel-style Deploys"
    ],
    cta: "Start Building",
    highlight: false
  },
  {
    name: "Pro",
    price: { monthly: "29", yearly: "24" },
    description: "For startups and growing teams.",
    features: [
      "Everything in Free",
      "Priority Agent Queue",
      "High-Perf GPUs",
      "Private Repo Integration",
      "Custom Domains & SSL"
    ],
    cta: "Go Pro",
    highlight: true
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Dedicated infrastructure for scale.",
    features: [
      "Everything in Pro",
      "On-prem Deployment",
      "SLA Guarantees",
      "Custom Agent Training",
      "Advanced Compliance (SOC2)"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Scale at your own pace.</h2>
        <p className="text-neutral-500 max-w-xl mx-auto">Start for free, upgrade when you need more power.</p>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm ${!isYearly ? "text-white" : "text-neutral-500"}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6 rounded-full bg-white/10 relative p-1 transition-colors hover:bg-white/20"
          >
            <motion.div
              animate={{ x: isYearly ? 24 : 0 }}
              className="w-4 h-4 rounded-full bg-neon-blue"
            />
          </button>
          <span className={`text-sm ${isYearly ? "text-white" : "text-neutral-500"}`}>Yearly (20% Off)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className={`relative flex flex-col h-full ${plan.highlight ? "border-neon-blue ring-1 ring-neon-blue/20" : ""}`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon-blue text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price.monthly === "Custom" ? "" : "$"}
                    {isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly !== "Custom" && <span className="text-neutral-500">/mo</span>}
                </div>
                <p className="text-sm text-neutral-500 mt-4">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-neutral-300">
                    <Check className="w-4 h-4 text-neon-blue" />
                    {feature}
                  </li>
                ))}
              </ul>
              <NeonButton variant={plan.highlight ? "default" : "ghost"} className="w-full">
                {plan.cta}
              </NeonButton>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
