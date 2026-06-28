"use client";
import { GlassCard } from "@aether/ui";
export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Security Center</h1>
      <GlassCard className="p-6 text-neutral-400">
        No active security alerts. System is hardened and monitored.
      </GlassCard>
    </div>
  );
}
