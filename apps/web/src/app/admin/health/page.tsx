"use client";
import { GlassCard } from "@aether/ui";
export default function HealthPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-bold mb-4 uppercase text-xs text-neutral-500">Service Status</h3>
          <div className="space-y-3">
             {[
               { name: "API Gateway", status: "Operational" },
               { name: "Auth Service", status: "Operational" },
               { name: "Agent Runtime", status: "Operational" },
               { name: "Database Cluster", status: "Operational" },
               { name: "File Storage", status: "Operational" },
             ].map(s => (
               <div key={s.name} className="flex justify-between items-center">
                 <span className="text-sm">{s.name}</span>
                 <span className="text-xs text-green-500 font-bold uppercase">{s.status}</span>
               </div>
             ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
