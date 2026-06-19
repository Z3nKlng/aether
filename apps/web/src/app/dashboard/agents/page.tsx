"use client";

import { GlassCard, NeonButton, Badge } from "@aether/ui";
import { Cpu, Brain, Code, Terminal, Zap, MessageSquare, Play, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentsPage() {
  const agents = [
    { 
      id: "arch-1", 
      name: "Architect", 
      role: "System Design & Schema", 
      status: "idle", 
      model: "GPT-4o",
      tasks: 142,
      efficiency: "94%",
      icon: Brain,
      color: "text-purple-400"
    },
    { 
      id: "front-1", 
      name: "Frontend Specialist", 
      role: "React, Next.js, Tailwind", 
      status: "working", 
      model: "Claude 3.5 Sonnet",
      tasks: 89,
      efficiency: "98%",
      icon: Code,
      color: "text-blue-400"
    },
    { 
      id: "back-1", 
      name: "Backend Specialist", 
      role: "Node.js, Go, Database", 
      status: "working", 
      model: "Claude 3.5 Sonnet",
      tasks: 112,
      efficiency: "96%",
      icon: Terminal,
      color: "text-emerald-400"
    },
    { 
      id: "devops-1", 
      name: "DevOps Bot", 
      role: "K8s, Docker, CI/CD", 
      status: "idle", 
      model: "GPT-4o mini",
      tasks: 256,
      efficiency: "99%",
      icon: Zap,
      color: "text-amber-400"
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Agents</h1>
          <p className="text-neutral-500 mt-2">Your autonomous engineering workforce.</p>
        </div>
        <NeonButton className="py-3 px-6 h-fit w-full md:w-auto">
          Hire New Agent
        </NeonButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${agent.color} border border-white/5`}>
                    <agent.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">{agent.role}</p>
                  </div>
                </div>
                <Badge variant={agent.status === 'working' ? 'default' : 'secondary'} className={agent.status === 'working' ? 'animate-pulse' : ''}>
                  {agent.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Model</p>
                  <p className="text-sm font-medium truncate">{agent.model}</p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Tasks</p>
                  <p className="text-sm font-medium">{agent.tasks}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Efficiency</p>
                  <p className="text-sm font-medium text-emerald-400">{agent.efficiency}</p>
                </div>
              </div>

              {agent.status === 'working' && (
                 <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-[10px] text-neutral-400">
                       <span>Refactoring auth-service...</span>
                       <span>72%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-neon-blue w-[72%] shadow-[0_0_10px_rgba(0,174,255,0.5)]" />
                    </div>
                 </div>
              )}

              <div className="mt-auto pt-6 border-t border-white/5 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/5">
                  <Settings className="w-3.5 h-3.5" />
                  Configure
                </button>
                <NeonButton className="px-4 py-2 rounded-lg text-xs" onClick={() => window.location.href='/dashboard/ide'}>
                  <Play className="w-3 h-3 mr-1.5" />
                  Direct
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <GlassCard className="p-8 bg-gradient-to-r from-neon-blue/10 to-transparent border-neon-blue/20">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold">Custom Agent Training</h2>
                 <p className="text-neutral-400 max-w-lg">Train agents on your specific codebase, coding standards, and internal documentation for 10x better performance.</p>
              </div>
              <NeonButton className="py-4 px-8 whitespace-nowrap">Explore Enterprise</NeonButton>
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
