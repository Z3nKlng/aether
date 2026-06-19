"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, NeonButton, Input, Label, Badge } from "@aether/ui";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Rocket, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Code, 
  Globe, 
  Database, 
  Github, 
  Cpu,
  ArrowRight,
  Plus
} from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [formData, setFormData] = useState({
    orgName: "",
    orgSlug: "",
    projectType: "web-app",
    agentSetup: "default",
    repoName: "",
  });

  const steps = [
    { title: "Organization", icon: Building2 },
    { title: "Project Type", icon: Globe },
    { title: "Agents", icon: Cpu },
    { title: "Connect", icon: Github },
    { title: "Launch", icon: Rocket },
  ];

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const completeOnboarding = () => {
    router.push("/dashboard/ide");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Step Indicator */}
        <div className="flex justify-between mb-12 px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3 relative">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                  step > i + 1 ? "border-neon-blue bg-neon-blue text-black" :
                  step === i + 1 ? "border-neon-blue bg-neon-blue/20 text-neon-blue shadow-[0_0_20px_rgba(0,174,255,0.3)]" : 
                  "border-white/5 bg-white/5 text-neutral-500"
                }`}
              >
                {step > i + 1 ? <Check className="w-6 h-6 stroke-[3]" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-black absolute -bottom-6 whitespace-nowrap ${step === i + 1 ? "text-neon-blue" : "text-neutral-600"}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`absolute top-6 left-12 w-[calc(100%+24px)] h-[2px] -z-0 transition-colors duration-500 ${step > i + 1 ? "bg-neon-blue" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Create your organization</h1>
                  <p className="text-neutral-400 text-lg">Every project in Aether belongs to an organization.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" placeholder="Acme Engineering" value={formData.orgName} onChange={(e) => setFormData({...formData, orgName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Workspace URL</Label>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-neutral-600 font-mono">aether.sh/</span>
                       <Input id="orgSlug" placeholder="acme-eng" value={formData.orgSlug} onChange={(e) => setFormData({...formData, orgSlug: e.target.value})} />
                    </div>
                  </div>
                </div>
                <NeonButton className="w-full py-4 text-lg" onClick={nextStep} disabled={!formData.orgName}>
                  Initialize Workspace <ChevronRight className="w-5 h-5 ml-2" />
                </NeonButton>
              </GlassCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">What are we building?</h1>
                  <p className="text-neutral-400 text-lg">Select a project type to optimize agent context.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "web-app", title: "Web Application", icon: Code, desc: "Next.js, React, Remix" },
                    { id: "api", title: "Backend API", icon: Database, desc: "Node.js, Go, Python" },
                    { id: "static", title: "Static Site", icon: Globe, desc: "Astro, Vite, HTML" },
                    { id: "custom", title: "Custom Stack", icon: Plus, desc: "Configure from scratch" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({...formData, projectType: type.id})}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        formData.projectType === type.id 
                          ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_20px_rgba(0,174,255,0.1)]" 
                          : "border-white/5 bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <type.icon className={`w-8 h-8 mb-4 ${formData.projectType === type.id ? "text-neon-blue" : "text-neutral-500"}`} />
                      <h3 className="font-bold text-lg">{type.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 text-neutral-500 hover:text-white" onClick={prevStep}>Back</button>
                  <NeonButton className="flex-[2] py-4 text-lg" onClick={nextStep}>Continue</NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8 space-y-8">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Configure your workforce</h1>
                  <p className="text-neutral-400 text-lg">Choose how your AI agents should coordinate.</p>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => setFormData({...formData, agentSetup: "default"})}
                    className={`w-full p-6 rounded-2xl border text-left flex items-center gap-6 transition-all ${
                      formData.agentSetup === "default" ? "border-neon-blue bg-neon-blue/10" : "border-white/5 bg-white/5"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
                       <Cpu className="text-neon-blue" />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-bold text-lg">Standard Team</h3>
                       <p className="text-sm text-neutral-500">Architect, Frontend, Backend, and DevOps agents.</p>
                    </div>
                    {formData.agentSetup === "default" && <Check className="text-neon-blue" />}
                  </button>
                  <button
                    onClick={() => setFormData({...formData, agentSetup: "custom"})}
                    className={`w-full p-6 rounded-2xl border text-left flex items-center gap-6 transition-all ${
                      formData.agentSetup === "custom" ? "border-purple-500 bg-purple-500/10" : "border-white/5 bg-white/5"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                       <Sparkles className="text-purple-500" />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-bold text-lg">Custom Setup</h3>
                       <p className="text-sm text-neutral-500">Define specialized roles and specific model routing.</p>
                    </div>
                    {formData.agentSetup === "custom" && <Check className="text-purple-500" />}
                  </button>
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 text-neutral-500 hover:text-white" onClick={prevStep}>Back</button>
                  <NeonButton className="flex-[2] py-4 text-lg" onClick={nextStep}>Continue</NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-8 space-y-8">
                <div className="space-y-2 text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Github className="w-8 h-8" />
                   </div>
                  <h1 className="text-3xl font-bold tracking-tight">Connect Repository</h1>
                  <p className="text-neutral-400 text-lg">Aether needs access to sync code and deploy.</p>
                </div>
                
                <div className="space-y-4">
                   <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-colors">
                      <Github className="w-5 h-5" />
                      Connect GitHub Account
                   </button>
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-4 text-neutral-600 font-mono">Or start blank</span></div>
                   </div>
                   <Input placeholder="Repository Name (optional)" value={formData.repoName} onChange={(e) => setFormData({...formData, repoName: e.target.value})} />
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 text-neutral-500 hover:text-white" onClick={prevStep}>Back</button>
                  <NeonButton className="flex-[2] py-4 text-lg" onClick={nextStep}>Skip for now</NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <GlassCard className="p-12 space-y-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,174,255,0.1),transparent_70%)]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-24 h-24 rounded-full bg-neon-blue/20 flex items-center justify-center mx-auto border border-neon-blue/50 shadow-[0_0_50px_rgba(0,174,255,0.3)] animate-pulse">
                    <Rocket className="w-12 h-12 text-neon-blue" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">System Ready</h1>
                    <p className="text-neutral-400 text-lg max-w-sm mx-auto">
                      Workspace <span className="text-white font-bold">{formData.orgName || "Default"}</span> is initialized. 
                      Your agents are standing by to start building.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                   <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                         <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2">Selected Stack</p>
                         <p className="text-sm font-medium">{formData.projectType.replace('-', ' ').toUpperCase()}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
                         <p className="text-[10px] text-neutral-500 uppercase font-bold mb-2">Agent Workforce</p>
                         <p className="text-sm font-medium">{formData.agentSetup === 'default' ? '4 CORE AGENTS' : 'CUSTOM CLUSTER'}</p>
                      </div>
                   </div>

                   <NeonButton className="w-full py-5 text-xl group shadow-[0_0_30px_rgba(0,174,255,0.4)]" onClick={completeOnboarding}>
                      Launch Browser IDE 
                      <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                   </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
