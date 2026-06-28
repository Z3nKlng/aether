"use client";

import { useState } from "react";
import { GlassCard } from "@aether/ui";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function AnalyticsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const metrics = [
    { label: "Revenue", value: "$128k", trend: "+12%" },
    { label: "Users", value: "42.8k", trend: "+8%" },
    { label: "Tasks", value: "1.2M", trend: "+24%" },
    { label: "Uptime", value: "99.99%", trend: "0%" },
  ];

  const logs = [
    { id: "TX-4928", time: "2026-06-08 01:04:12", event: "AI_TASK_COMPLETE", actor: "ArchitectAgent", status: "success", detail: "Component scaffolding finalized." },
    { id: "TX-4927", time: "2026-06-08 01:02:55", event: "DEPLOY_STARTED", actor: "DevOpsAgent", status: "success", detail: "Vercel preview generated." },
    { id: "TX-4926", time: "2026-06-08 00:58:30", event: "AUTH_FAILURE", actor: "user_8421", status: "error", detail: "Invalid session token." },
    { id: "TX-4925", time: "2026-06-08 00:55:12", event: "DB_QUERY_LONG", actor: "AnalyticsAgent", status: "warning", detail: "Query took 4.2s on 'users' table." },
    { id: "TX-4924", time: "2026-06-08 00:52:05", event: "AGENT_WAKE", actor: "ProductAgent", status: "success", detail: "Manual activation by admin." },
    { id: "TX-4923", time: "2026-06-08 00:50:44", event: "BILLING_SYNC", actor: "System", status: "success", detail: "Stripe webhook processed." },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Logs</h1>
          <p className="text-neutral-500 text-sm">Granular system events and metric performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
            <Calendar size={16} className="text-neutral-400" />
            <span className="text-sm font-medium">Last 24 Hours</span>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <GlassCard key={i} className="p-6">
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{m.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{m.value}</span>
              <span className="text-xs text-green-500 font-mono">{m.trend}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Table View */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" 
              placeholder="Search logs, events, or actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-600/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
              {['all', 'success', 'error'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold transition-all ${filter === t ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="p-2 bg-black/40 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-white/5">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Detail</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-neutral-400">{log.id}</td>
                  <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                      {log.event}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{log.actor}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' && <CheckCircle2 size={14} className="text-green-500" />}
                      {log.status === 'warning' && <AlertCircle size={14} className="text-yellow-500" />}
                      {log.status === 'error' && <XCircle size={14} className="text-red-500" />}
                      <span className="capitalize">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 max-w-xs truncate">{log.detail}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-white/10 rounded-md text-neutral-500 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Showing <span className="text-white font-medium">1-10</span> of <span className="text-white font-medium">1,242</span> events
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
