"use client";

import { GlassCard, NeonButton, Badge } from "@aether/ui";
import { Users, UserPlus, Mail, Shield, MoreHorizontal, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamPage() {
  const members = [
    { 
      id: 1, 
      name: "Alex Rivera", 
      email: "alex@aether.sh", 
      role: "Owner", 
      avatar: "AR",
      status: "active" 
    },
    { 
      id: 2, 
      name: "Sarah Chen", 
      email: "sarah@aether.sh", 
      role: "Admin", 
      avatar: "SC",
      status: "active" 
    },
    { 
      id: 3, 
      name: "Marcus Thorne", 
      email: "marcus@company.com", 
      role: "Member", 
      avatar: "MT",
      status: "pending" 
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-neutral-500 mt-2">Manage your organization members and their permissions.</p>
        </div>
        <NeonButton className="py-3 px-6 h-fit w-full md:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </NeonButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <p className="text-sm text-neutral-500 mb-1">Total Members</p>
          <p className="text-3xl font-bold">12</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-sm text-neutral-500 mb-1">Available Seats</p>
          <p className="text-3xl font-bold">Unlimited</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-sm text-neutral-500 mb-1">Pending Invites</p>
          <p className="text-3xl font-bold">3</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            placeholder="Search members..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
          />
        </div>

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-medium text-neutral-400">Member</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">Role</th>
                  <th className="px-6 py-4 font-medium text-neutral-400">Status</th>
                  <th className="px-6 py-4 font-medium text-neutral-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member, i) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-xs">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-neutral-300">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-500">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div className="pt-8">
         <h2 className="text-xl font-semibold mb-6">Roles & Permissions</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Owner", desc: "Full access to all projects, billing, and organization settings." },
              { title: "Admin", desc: "Can manage members and projects, but cannot access billing." },
              { title: "Member", desc: "Can view and edit projects they are assigned to." },
              { title: "Viewer", desc: "Read-only access to projects and agent activity." },
            ].map((role) => (
              <GlassCard key={role.title} className="p-6 border-white/5">
                <h3 className="font-bold mb-2">{role.title}</h3>
                <p className="text-sm text-neutral-500">{role.desc}</p>
              </GlassCard>
            ))}
         </div>
      </div>
    </div>
  );
}
