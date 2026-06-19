"use client";

import { GlassCard } from "@aether/ui";
import { useDashboardStore } from "@/store/use-dashboard-store";
import { 
  Rocket, 
  Cpu, 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { stats, activities: recentActivity, agents } = useDashboardStore();
  
  const statsList = [
    { label: "Active Agents", value: stats.activeAgents, icon: Cpu, color: "text-blue-400" },
    { label: "Deployments", value: stats.deployments, icon: Rocket, color: "text-purple-400" },
    { label: "Uptime", value: stats.uptime, icon: Activity, color: "text-emerald-400" },
    { label: "AI Tokens", value: stats.tokens, icon: Zap, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-neutral-500 mt-2">Welcome back. Your autonomous engineering team is running smoothly.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, i) => (
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
                  <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <button className="text-sm text-neon-blue hover:underline">View all</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <GlassCard className="p-4 flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${
                    activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                    activity.status === 'error' ? 'bg-red-500/10 text-red-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activity.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     activity.status === 'error' ? <AlertCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{activity.title}</p>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">{activity.time}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-1">{activity.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Agents */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Active Agents</h2>
          <GlassCard className="p-6 space-y-6">
            {agents.map((agent) => (
              <div key={agent.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-neutral-500 text-xs">{agent.role}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    className="h-full bg-neon-blue shadow-[0_0_8px_rgba(0,174,255,0.5)]"
                  />
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
              Manage Workforce
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
