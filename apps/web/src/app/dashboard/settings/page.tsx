"use client";

import { GlassCard, NeonButton, Label, Input, Badge } from "@aether/ui";
import { User, Building2, Bell, Shield, Key, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-neutral-500 mt-2">Manage your account and workspace preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Sidebar */}
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1 max-w-2xl">
          <GlassCard className="p-8">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-1">Personal Information</h2>
                  <p className="text-sm text-neutral-500">Update your avatar and personal details.</p>
                </div>

                <div className="flex items-center gap-6 py-4">
                   <div className="w-20 h-20 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center text-2xl font-bold">
                      AR
                   </div>
                   <div className="space-y-2">
                      <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors">
                        Change Avatar
                      </button>
                      <p className="text-[10px] text-neutral-500">JPG, GIF or PNG. Max size of 800K</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Full Name</Label>
                    <Input id="firstName" defaultValue="Alex Rivera" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="alex@aether.sh" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                    defaultValue="Frontend Architect building the future of autonomous engineering at Aether."
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                   <NeonButton className="px-8">Save Changes</NeonButton>
                </div>
              </motion.div>
            )}

            {activeTab === 'organization' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-1">Organization Settings</h2>
                  <p className="text-sm text-neutral-500">Manage your workspace and organization identity.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" defaultValue="Aether Corp" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">URL Slug</Label>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-neutral-500 font-mono">aether.sh/</span>
                       <Input id="orgSlug" defaultValue="aether-corp" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                   <p className="text-xs text-neutral-500">Organization ID: <span className="font-mono">org_2938472</span></p>
                   <NeonButton className="px-8">Update Organization</NeonButton>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold mb-1">Security</h2>
                  <p className="text-sm text-neutral-500">Secure your account and generate API keys.</p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Key className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-sm font-medium">Two-Factor Authentication</p>
                            <p className="text-xs text-neutral-500">Enabled on June 12, 2025</p>
                         </div>
                      </div>
                      <button className="text-xs text-red-400 hover:underline">Disable</button>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">API Keys</h3>
                         <button className="text-xs text-neon-blue hover:underline">Create Key</button>
                      </div>
                      <div className="space-y-2">
                         <div className="p-3 rounded-lg border border-white/5 bg-black/40 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <span className="text-xs font-mono text-neutral-400">sk_live_••••••••••••4j92</span>
                               <Badge variant="outline" className="text-[8px] h-4">Read/Write</Badge>
                            </div>
                            <button className="p-1.5 hover:bg-white/5 rounded transition-colors text-neutral-500">
                               <MoreHorizontal className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function MoreHorizontal({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}
