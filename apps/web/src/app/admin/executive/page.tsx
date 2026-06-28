"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@aether/ui";
import { 
  DollarSign, 
  UserPlus, 
  UserMinus, 
  Target,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Globe,
  Award
} from "lucide-react";

export default function ExecutiveDashboard() {
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueData = [45, 52, 48, 61, 58, 72, 68, 85, 82, 95, 92, 110];
  const acquisitionData = [30, 35, 40, 55, 65, 80, 85, 95, 110, 125, 140, 160];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Executive Intelligence</h1>
        <p className="text-neutral-500 text-sm">Strategic performance metrics and long-term trajectory.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "ARR", value: "$1.54M", sub: "+18% YoY", icon: DollarSign, color: "text-emerald-500" },
          { label: "LTV", value: "$842", sub: "Up $120", icon: UserPlus, color: "text-blue-500" },
          { label: "Churn", value: "1.4%", sub: "-0.2% MoM", icon: UserMinus, color: "text-red-500" },
          { label: "CAC", value: "$125", sub: "Stable", icon: Target, color: "text-purple-500" },
        ].map((item, i) => (
          <GlassCard key={i} className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5">
                <item.icon className={item.color} size={24} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">{item.label}</p>
                <p className="text-2xl font-bold tracking-tight">{item.value}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend - CSS Bars */}
        <GlassCard className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400">Revenue Trend (12 Months)</h3>
            <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Target: $2.0M</span>
          </div>
          <div className="flex items-end justify-between h-64 gap-2 px-2">
            {revenueData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  className="w-full bg-gradient-to-t from-emerald-600/20 to-emerald-500 rounded-t-md relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 text-[10px] px-1.5 py-0.5 rounded font-mono">
                    ${val}k
                  </div>
                </motion.div>
                <span className="text-[10px] text-neutral-500 font-mono rotate-[-45deg] md:rotate-0">{months[i]}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* User Acquisition - CSS Gradient Area */}
        <GlassCard className="p-8">
           <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400">User Acquisition Growth</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Active Fleet</span>
            </div>
          </div>
          <div className="relative h-64 w-full flex items-end">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={`M 0 100 ${acquisitionData.map((v, i) => `L ${(i / (acquisitionData.length - 1)) * 100} ${100 - v / 2}`).join(' ')} L 100 100 Z`}
                fill="url(#gradient-blue)"
              />
              <path 
                d={`M 0 ${100 - acquisitionData[0] / 2} ${acquisitionData.map((v, i) => `L ${(i / (acquisitionData.length - 1)) * 100} ${100 - v / 2}`).join(' ')}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-between px-2 pt-4">
               {months.map((m, i) => (
                 <span key={i} className="text-[10px] text-neutral-500 font-mono">{m}</span>
               ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Conversion Funnel */}
      <GlassCard className="p-8">
        <h3 className="font-bold text-sm uppercase tracking-widest text-neutral-400 mb-8">Conversion Funnel Efficiency</h3>
        <div className="flex flex-col gap-1 max-w-2xl mx-auto">
          {[
            { label: "Awareness", value: "1,240,000", pct: "100%", color: "bg-neutral-800" },
            { label: "Engagement", value: "420,000", pct: "34%", color: "bg-red-900/40" },
            { label: "Activation", value: "125,000", pct: "10%", color: "bg-red-800/60" },
            { label: "Retention", value: "42,000", pct: "3.4%", color: "bg-red-700/80" },
            { label: "Revenue", value: "1,242", pct: "0.1%", color: "bg-red-600" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div 
                className={`h-12 ${step.color} rounded flex items-center justify-between px-6 transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max(15, 100 - i * 15)}%` }}
              >
                <span className="text-xs font-bold uppercase tracking-widest">{step.label}</span>
                <span className="font-mono text-sm">{step.value}</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                {step.pct}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Growth Opportunities */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Strategic Growth Opportunities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                <th className="px-8 py-4">Opportunity</th>
                <th className="px-8 py-4">Est. Impact</th>
                <th className="px-8 py-4">Confidence</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {[
                { name: "Enterprise AI Upsell", impact: "+$420k ARR", conf: "High", status: "Exploration", prio: "P0", icon: Zap },
                { name: "EU Region Expansion", impact: "+25% Growth", conf: "Medium", status: "In Progress", prio: "P1", icon: Globe },
                { name: "Self-Serve Billing v2", impact: "-2% Churn", conf: "High", status: "Design", prio: "P1", icon: DollarSign },
                { name: "Agency Partner Program", impact: "+15% Pipeline", conf: "Low", status: "Backlog", prio: "P2", icon: Award },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/5 text-neutral-400"><row.icon size={16} /></div>
                      <span className="font-bold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-emerald-500 font-medium">{row.impact}</td>
                  <td className="px-8 py-4 text-neutral-400">{row.conf}</td>
                  <td className="px-8 py-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className={`text-xs font-bold ${row.prio === 'P0' ? 'text-red-500' : 'text-neutral-500'}`}>{row.prio}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
