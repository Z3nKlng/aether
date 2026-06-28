"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, NeonButton } from "@aether/ui";
import { 
  Cpu, 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  History, 
  Database, 
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'error' | 'offline';
  tasks: number;
  successRate: string;
  avgDuration: string;
  lastActive: string;
  memory: string;
  queue: number;
}

const initialAgents: Agent[] = [
  { id: "1", name: "Operations Agent", status: "online", tasks: 8421, successRate: "99.2%", avgDuration: "120ms", lastActive: "Just now", memory: "1.2GB", queue: 0 },
  { id: "2", name: "Customer Success Agent", status: "online", tasks: 3102, successRate: "98.5%", avgDuration: "450ms", lastActive: "2m ago", memory: "840MB", queue: 2 },
  { id: "3", name: "Analytics Agent", status: "idle", tasks: 12450, successRate: "99.8%", avgDuration: "2.4s", lastActive: "15m ago", memory: "2.4GB", queue: 0 },
  { id: "4", name: "Product Agent", status: "online", tasks: 5410, successRate: "97.4%", avgDuration: "1.8s", lastActive: "Just now", memory: "1.6GB", queue: 5 },
  { id: "5", name: "Content Agent", status: "error", tasks: 2150, successRate: "94.2%", avgDuration: "800ms", lastActive: "1h ago", memory: "512MB", queue: 0 },
  { id: "6", name: "Market Research Agent", status: "offline", tasks: 942, successRate: "100%", avgDuration: "5.2s", lastActive: "3d ago", memory: "0MB", queue: 0 },
];

export default function AgentMonitor() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: string } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-neutral-600';
    }
  };

  const handleAction = (id: string, type: string) => {
    setConfirmAction({ id, type });
  };

  const processAction = () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        if (type === 'stop') return { ...a, status: 'offline' as const };
        if (type === 'start') return { ...a, status: 'online' as const };
        if (type === 'restart') return { ...a, status: 'online' as const };
      }
      return a;
    }));
    setConfirmAction(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Fleet Monitor</h1>
          <p className="text-neutral-500 text-sm">Control and monitor your autonomous engineering workforce.</p>
        </div>
        <div className="flex items-center gap-3">
          <NeonButton variant="secondary" size="sm">Scale Fleet</NeonButton>
          <NeonButton size="sm">Sync All</NeonButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <GlassCard key={agent.id} className="p-6 flex flex-col gap-6 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-red-500/30 transition-colors">
                  <Cpu size={24} className={agent.status === 'error' ? 'text-red-500' : 'text-neutral-400'} />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-widest">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{agent.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                {agent.status === 'online' || agent.status === 'idle' ? (
                  <button 
                    onClick={() => handleAction(agent.id, 'stop')}
                    className="p-1.5 hover:bg-red-500/10 rounded-md text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Square size={14} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAction(agent.id, 'start')}
                    className="p-1.5 hover:bg-green-500/10 rounded-md text-neutral-500 hover:text-green-500 transition-colors"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                )}
                <button 
                  onClick={() => handleAction(agent.id, 'restart')}
                  className="p-1.5 hover:bg-white/10 rounded-md text-neutral-500 hover:text-white transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <Activity size={10} /> Tasks
                </p>
                <p className="font-mono text-sm">{agent.tasks}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Success
                </p>
                <p className="font-mono text-sm text-green-500">{agent.successRate}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <History size={10} /> Avg Dur
                </p>
                <p className="font-mono text-sm">{agent.avgDuration}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                  <Layers size={10} /> Queue
                </p>
                <p className={`font-mono text-sm ${agent.queue > 0 ? 'text-yellow-500' : 'text-neutral-400'}`}>{agent.queue}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
              <div className="flex items-center gap-1">
                <Database size={10} /> {agent.memory}
              </div>
              <div>
                Last active: {agent.lastActive}
              </div>
            </div>

            {agent.status === 'error' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
            )}
          </GlassCard>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-2">Confirm Action</h2>
              <p className="text-neutral-400 text-sm mb-8">
                Are you sure you want to <span className="text-white font-bold uppercase">{confirmAction.type}</span> the {agents.find(a => a.id === confirmAction.id)?.name}?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={processAction}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    confirmAction.type === 'stop' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
