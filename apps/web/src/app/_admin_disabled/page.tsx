"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@aether/ui";
import { 
  TrendingUp, 
  Users, 
  Cpu, 
  Activity, 
  Megaphone, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline = ({ data, color }: SparklineProps) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className="flex items-end gap-0.5 h-full w-full">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: ((val - min) / range) * 100 + "%" }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="flex-1 min-w-[2px] rounded-t-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

interface DashboardPanelProps {
  title: string;
  value: string;
  trend: string;
  trendDir: 'up' | 'down';
  icon: any;
  color: string;
  sparkData: number[];
  details: Record<string, string>;
}

const DashboardPanel = ({ title, value, trend, trendDir, icon: Icon, color, sparkData, details }: DashboardPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassCard className="p-6 flex flex-col gap-4 overflow-hidden group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 text-neutral-400 group-hover:text-white transition-colors">
            <Icon size={20} />
          </div>
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{title}</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trendDir === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trendDir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>

      <div className="flex items-end justify-between gap-8">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 uppercase">Current Period</span>
        </div>
        <div className="h-12 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-widest transition-colors w-full"
        >
          View Full Details
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2 pt-2"
            >
              {Object.entries(details).map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-mono text-neutral-300">{val}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-neutral-500 text-sm">Real-time health and performance across the Aether ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardPanel 
          title="Revenue"
          value="$128,430"
          trend="+12.5%"
          trendDir="up"
          icon={TrendingUp}
          color="#10b981"
          sparkData={[40, 35, 45, 50, 48, 60, 55, 70]}
          details={{
            "MRR": "$12,430",
            "ARR": "$149,160",
            "Payment Volume": "$420,000",
            "Active Subs": "1,242"
          }}
        />
        <DashboardPanel 
          title="User Growth"
          value="42,891"
          trend="+8.2%"
          trendDir="up"
          icon={Users}
          color="#3b82f6"
          sparkData={[20, 25, 22, 30, 35, 40, 38, 45]}
          details={{
            "DAU": "8,421",
            "MAU": "32,891",
            "Churn Rate": "1.4%",
            "Signups (Today)": "142"
          }}
        />
        <DashboardPanel 
          title="AI Performance"
          value="1.2M"
          trend="+24.1%"
          trendDir="up"
          icon={Cpu}
          color="#8b5cf6"
          sparkData={[60, 65, 70, 75, 72, 85, 90, 95]}
          details={{
            "Tasks (Today)": "12,450",
            "Avg Latency": "1.2s",
            "Token Usage": "4.2B",
            "Success Rate": "99.4%"
          }}
        />
        <DashboardPanel 
          title="Infrastructure"
          value="99.99%"
          trend="0.00%"
          trendDir="up"
          icon={Activity}
          color="#06b6d4"
          sparkData={[100, 100, 99, 100, 100, 100, 100, 100]}
          details={{
            "API Gateway": "Operational",
            "Agent Runtime": "Operational",
            "Database Cluster": "Operational",
            "Error Rate": "0.02%"
          }}
        />
        <DashboardPanel 
          title="Marketing"
          value="3.42%"
          trend="-0.5%"
          trendDir="down"
          icon={Megaphone}
          color="#f59e0b"
          sparkData={[45, 42, 40, 38, 35, 33, 30, 28]}
          details={{
            "Traffic": "1.2M hits",
            "Conv Rate": "3.42%",
            "Active Campaigns": "12",
            "CPA": "$12.40"
          }}
        />
        <DashboardPanel 
          title="Security"
          value="Safe"
          trend="0 Alerts"
          trendDir="up"
          icon={ShieldAlert}
          color="#ef4444"
          sparkData={[0, 0, 1, 0, 0, 0, 1, 0]}
          details={{
            "Active Threats": "0",
            "Audit Log Count": "1.2M",
            "Vulnerabilities": "Resolved",
            "SSO Status": "Encrypted"
          }}
        />
      </div>
    </div>
  );
}
