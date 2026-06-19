"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GlassCard, NeonButton, Input, Label } from "@aether/ui";
import { Github, Mail, Chrome, Disc as Discord, Apple, User, Building2, Link as LinkIcon, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    orgName: "",
    orgSlug: "",
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API route to create the user and org
    console.log("Registering:", formData);
    signIn("credentials", { email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-neon-blue/5 blur-[100px] rounded-full w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        <GlassCard className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">Initialize Aether</h1>
            <p className="text-neutral-500 text-lg">Create your account and organization</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                   <User className="w-4 h-4" /> Full Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                   <Mail className="w-4 h-4" /> Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@company.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                 <Lock className="w-4 h-4" /> Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="pt-4 border-t border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="flex items-center gap-2">
                     <Building2 className="w-4 h-4" /> Organization Name
                  </Label>
                  <Input 
                    id="orgName" 
                    placeholder="Acme Inc" 
                    required 
                    value={formData.orgName}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      setFormData({...formData, orgName: e.target.value, orgSlug: slug});
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSlug" className="flex items-center gap-2">
                     <LinkIcon className="w-4 h-4" /> Workspace URL
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs font-mono">aether.sh/</span>
                    <Input 
                      id="orgSlug" 
                      className="pl-20 font-mono text-xs" 
                      placeholder="acme-inc" 
                      required 
                      value={formData.orgSlug}
                      onChange={(e) => setFormData({...formData, orgSlug: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <NeonButton type="submit" className="w-full py-4 text-lg">
              Create Account
            </NeonButton>

            <div className="flex justify-center">
              <button 
                type="button"
                onClick={() => signIn("email", { email: formData.email })}
                className="text-xs text-neutral-500 hover:text-neon-blue transition-colors font-mono uppercase tracking-widest"
              >
                Or email me a magic link
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-4 text-neutral-500 font-mono">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => signIn("github")} className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <Github className="w-5 h-5 group-hover:text-neon-blue" />
            </button>
            <button onClick={() => signIn("google")} className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <Chrome className="w-5 h-5 group-hover:text-neon-blue" />
            </button>
            <button onClick={() => signIn("discord")} className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <Discord className="w-5 h-5 group-hover:text-neon-blue" />
            </button>
            <button onClick={() => signIn("apple")} className="flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
              <Apple className="w-5 h-5 group-hover:text-neon-blue" />
            </button>
          </div>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-neon-blue hover:underline">Sign in</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
