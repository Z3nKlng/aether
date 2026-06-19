"use client";

import { GlassCard, NeonButton, Badge } from "@aether/ui";
import { Check, CreditCard, Zap, Shield, Zap as FlashIcon, History, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function BillingPage() {
  const plans = [
    {
      name: "Free Forever",
      price: "$0",
      description: "Everything you need to build and scale your products.",
      features: [
        "Unlimited Projects",
        "Unlimited Deployments",
        "Unlimited AI Chats",
        "Unlimited Collaborators",
        "Community Support"
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      description: "For serious developers and small teams.",
      features: [
        "Priority AI Queue",
        "Dedicated Compute",
        "Custom Domains",
        "24/7 Priority Support",
        "Advanced Analytics"
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Scale with compliance, security, and control.",
      features: [
        "Dedicated GPUs",
        "Private LLM Models",
        "SOC2/HIPAA Compliance",
        "SSO & SAML",
        "Custom SLA"
      ],
      current: false,
    }
  ];

  const usageData = [
    { label: "Mon", tokens: 45 },
    { label: "Tue", tokens: 82 },
    { label: "Wed", tokens: 61 },
    { label: "Thu", tokens: 95 },
    { label: "Fri", tokens: 110 },
    { label: "Sat", tokens: 30 },
    { label: "Sun", tokens: 25 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-neutral-500 mt-2">Manage your subscription and usage credits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className={`h-full flex flex-col p-8 ${plan.current ? 'border-neon-blue/50 ring-1 ring-neon-blue/20' : 'border-white/5'}`}>
              {plan.current && (
                <div className="absolute top-4 right-8">
                  <Badge variant="default">Current Plan</Badge>
                </div>
              )}
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-neutral-500">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-neutral-500 mt-4">{plan.description}</p>
                </div>

                <div className="pt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span className="text-sm text-neutral-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <NeonButton 
                  className="w-full py-3" 
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Active Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade to " + plan.name}
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Usage Stats & Graph */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon-blue" />
            Usage Analytics
          </h2>
          <GlassCard className="p-6 space-y-8">
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest font-mono">Tokens / Day</p>
                     <p className="text-3xl font-bold mt-1">128,492</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">+12% vs last week</Badge>
               </div>
               
               <div className="h-40 flex items-end justify-between gap-2 pt-4">
                  {usageData.map((data, i) => (
                     <div key={data.label} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${data.tokens}%` }}
                           transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                           className="w-full bg-neon-blue/20 border-t-2 border-neon-blue rounded-t-sm relative group"
                        >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {data.tokens}k
                           </div>
                        </motion.div>
                        <span className="text-[10px] text-neutral-600 font-mono">{data.label}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
               <div className="space-y-2">
                  <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">GPU Hours</p>
                  <p className="text-xl font-bold">14.2 <span className="text-sm font-normal text-neutral-600">/ 50h</span></p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 w-[28%]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Storage</p>
                  <p className="text-xl font-bold">2.4 <span className="text-sm font-normal text-neutral-600">/ 10GB</span></p>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[24%]" />
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>

        {/* Payment Method */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Payment Method
          </h2>
          <GlassCard className="p-6 h-[272px] flex flex-col justify-between">
            <div className="space-y-6">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-neutral-900 border border-white/10 rounded flex items-center justify-center">
                        <div className="w-8 h-4 bg-white/10 rounded" />
                     </div>
                     <div>
                        <p className="text-sm font-medium">Visa ending in 4242</p>
                        <p className="text-xs text-neutral-500">Expires 12/2026</p>
                     </div>
                  </div>
                  <button className="text-xs text-neutral-500 hover:text-white transition-colors border border-white/10 px-3 py-1 rounded-md">Edit</button>
               </div>
               
               <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-neutral-500">Next billing date</span>
                     <span className="text-white font-medium">June 1, 2026</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-neutral-500">Estimated total</span>
                     <span className="text-white font-medium">$0.00</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] text-neutral-400">Your payment information is encrypted and secured by Stripe.</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-6 mt-12">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-neutral-400" />
          Billing History
        </h2>
        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 font-medium text-neutral-400">Invoice</th>
                <th className="px-6 py-4 font-medium text-neutral-400">Date</th>
                <th className="px-6 py-4 font-medium text-neutral-400">Amount</th>
                <th className="px-6 py-4 font-medium text-neutral-400">Status</th>
                <th className="px-6 py-4 font-medium text-neutral-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { id: "INV-2026-001", date: "May 1, 2026", amount: "$0.00", status: "Paid" },
                { id: "INV-2026-002", date: "Apr 1, 2026", amount: "$0.00", status: "Paid" },
                { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$0.00", status: "Paid" },
              ].map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{inv.id}</td>
                  <td className="px-6 py-4 text-neutral-400">{inv.date}</td>
                  <td className="px-6 py-4 font-medium">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-neon-blue hover:underline text-xs">Download PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}
