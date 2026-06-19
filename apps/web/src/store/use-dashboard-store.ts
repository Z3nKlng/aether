"use client";

import { create } from "zustand";

interface ActivityItem {
  id: number;
  type: "deploy" | "agent" | "alert";
  title: string;
  desc: string;
  time: string;
  status: "success" | "error" | "info";
}

interface AgentItem {
  name: string;
  role: string;
  progress: number;
  status: "idle" | "working" | "error";
}

interface DashboardState {
  stats: {
    activeAgents: string;
    deployments: string;
    uptime: string;
    tokens: string;
  };
  activities: ActivityItem[];
  agents: AgentItem[];
  
  addActivity: (activity: Omit<ActivityItem, "id">) => void;
  updateAgentProgress: (name: string, progress: number) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: {
    activeAgents: "12",
    deployments: "48",
    uptime: "99.9%",
    tokens: "1.2M",
  },
  activities: [
    { 
      id: 1, 
      type: "deploy", 
      title: "Production Deploy", 
      desc: "Aether Engine v1.2.0 successfully deployed to main", 
      time: "2m ago",
      status: "success" 
    },
    { 
      id: 2, 
      type: "agent", 
      title: "Architect Agent", 
      desc: "Generated new GraphQL schema for billing service", 
      time: "15m ago",
      status: "info" 
    },
    { 
      id: 3, 
      type: "alert", 
      title: "Build Failed", 
      desc: "Type error in packages/agent-runtime/index.ts", 
      time: "1h ago",
      status: "error" 
    },
  ],
  agents: [
    { name: "Frontend Architect", role: "UI/UX", progress: 85, status: "working" },
    { name: "Backend Lead", role: "API Design", progress: 40, status: "working" },
    { name: "DevOps Bot", role: "CI/CD", progress: 100, status: "idle" },
  ],

  addActivity: (activity) => set((state) => ({
    activities: [{ ...activity, id: Date.now() }, ...state.activities]
  })),
  updateAgentProgress: (name, progress) => set((state) => ({
    agents: state.agents.map(a => a.name === name ? { ...a, progress } : a)
  })),
}));
