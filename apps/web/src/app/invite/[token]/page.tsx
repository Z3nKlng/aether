"use client";

import { GlassCard, NeonButton, Badge } from "@aether/ui";
import { UserPlus, Building2, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  
  // Mock invite data
  const invite = {
    inviter: "Sarah Chen",
    organization: "Aether Engine",
    role: "Engineer"
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <GlassCard className="p-8 text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <UserPlus className="w-8 h-8 text-neon-blue" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">You&apos;ve been invited</h1>
              <p className="text-neutral-400">
                <span className="text-white font-medium">{invite.inviter}</span> has invited you to join 
                <span className="text-white font-medium"> {invite.organization}</span>
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-left flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-neutral-500" />
               </div>
               <div>
                  <p className="text-sm font-medium">{invite.organization}</p>
                  <p className="text-xs text-neutral-500">Workspace</p>
               </div>
            </div>
            <Badge variant="default">{invite.role}</Badge>
          </div>

          <div className="space-y-3">
             <NeonButton className="w-full py-4" onClick={() => router.push("/onboarding")}>
               Accept Invitation
             </NeonButton>
             <button 
               className="w-full py-4 text-neutral-500 hover:text-white transition-colors text-sm font-medium"
               onClick={() => router.push("/auth/signin")}
             >
               Decline
             </button>
          </div>

          <p className="text-[10px] text-neutral-600">
             Logged in as <span className="text-neutral-400">user@example.com</span>. Not you? 
             <button className="ml-1 text-neon-blue hover:underline">Switch account</button>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
