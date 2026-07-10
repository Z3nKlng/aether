"use client";

import { motion } from "framer-motion";
import { GlassCard, NeonButton } from "@aether/ui";
import {
  Cpu,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  Users,
  Activity,
  Zap,
  BarChart3,
  ArrowRight,
  Plus,
  Sparkles,
  Bot,
  Globe,
  Code2,
  Star,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Projects", value: "3", icon: Rocket, color: "text-blue-400", trend: "+1 this week" },
  { label: "AI Tasks Completed", value: "1,247", icon: Cpu, color: "text-emerald-400", trend: "+18% vs last week" },
  { label: "Deployments", value: "89", icon: Globe, color: "text-purple-400", trend: "12 this month" },
  { label: "Team Members", value: "5", icon: Users, color: "text-amber-400", trend: "2 active now" },
];

const recentActivity = [
  { id: 1, title: "AI Builder deployed", desc: "Project 'landing-page' deployed to production", time: "2m ago", status: "success" as const, icon: Rocket },
  { id: 2, title: "Code review completed", desc: "AI agent reviewed PR #42 — 0 issues found", time: "15m ago", status: "success" as const, icon: CheckCircle2 },
  { id: 3, title: "Build failed", desc: "Pipeline 'api-service' failed on lint step", time: "1h ago", status: "error" as const, icon: AlertCircle },
  { id: 4, title: "New agent deployed", desc: "Operations Agent started monitoring workflows", time: "2h ago", status: "success" as const, icon: Bot },
  { id: 5, title: "Database migration", desc: "Schema updated with new CollaborationSession model", time: "3h ago", status: "success" as const, icon: Database },
];

const quickActions = [
  { label: "New Project", icon: Plus, href: "/dashboard/ide", desc: "Start building with AI" },
  { label: "View Agents", icon: Bot, href: "/dashboard/agents", desc: "Monitor AI workforce" },
  { label: "Deployments", icon: Rocket, href: "/dashboard/projects", desc: "Recent deployments" },
  { label: "Team Settings", icon: Users, href: "/dashboard/settings", desc: "Manage members" },
];

import { Database } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-neutral-500 mt-2">Your autonomous engineering team is running smoothly.</p>
        </div>
        <Link href="/dashboard/ide">
          <NeonButton variant="primary" className="px-6 py-2.5">
            <Sparkles className="w-4 h-4" />
            New Project
          </NeonButton>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight text-white">{stat.value}</p>
                  <p className="text-xs mt-1 text-neutral-600">{stat.trend}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link key={action.label} href={action.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors flex items-center justify-center mb-3">
                <action.icon className="w-5 h-5 text-neon-blue" />
              </div>
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <button className="text-sm text-neon-blue hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <GlassCard className="p-4 flex items-start gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                    activity.status === "success" ? "bg-emerald-500/10 text-emerald-500" :
                    activity.status === "error" ? "bg-red-500/10 text-red-500" :
                    "bg-blue-500/10 text-blue-500"
                  }`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{activity.title}</p>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-1">{activity.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Agents */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Active Agents</h2>
            <GlassCard className="p-6 space-y-5">
              {[
                { name: "Code Architect", role: "Design", progress: 100, status: "idle" },
                { name: "Frontend Engineer", role: "Building", progress: 67, status: "active" },
                { name: "QA Tester", role: "Testing", progress: 34, status: "active" },
                { name: "DevOps", role: "Deploying", progress: 82, status: "active" },
              ].map((agent) => (
                <div key={agent.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-neutral-600"
                      }`} />
                      <span className="font-medium text-white">{agent.name}</span>
                    </div>
                    <span className="text-neutral-500 text-xs">{agent.role}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-neon-blue to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
              <Link href="/dashboard/agents">
                <NeonButton variant="ghost" className="w-full py-2.5 text-sm">
                  <Bot className="w-4 h-4" />
                  Manage Workforce
                </NeonButton>
              </Link>
            </GlassCard>
          </div>

          {/* Quick Stats */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">API Latency</span>
                <span className="text-emerald-400 font-mono">23ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Uptime</span>
                <span className="text-emerald-400 font-mono">99.97%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Queue Depth</span>
                <span className="text-amber-400 font-mono">4</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Memory</span>
                <span className="text-blue-400 font-mono">1.2 GB</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}