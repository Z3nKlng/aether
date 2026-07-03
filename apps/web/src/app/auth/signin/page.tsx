"use client";

import { signIn } from "next-auth/react";
import { GlassCard, NeonButton } from "@aether/ui";
import { useState } from "react";
import { ExternalLink as Github, Mail, Globe as Chrome, Disc as Discord, Apple, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

import { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20, stiffness: 100 } },
};

const oauthProviders = [
  { id: "github", label: "GitHub", icon: Github, color: "hover:bg-white/5" },
  { id: "google", label: "Google", icon: Chrome, color: "hover:bg-white/5" },
  { id: "discord", label: "Discord", icon: Discord, color: "hover:bg-white/5" },
  { id: "apple", label: "Apple", icon: Apple, color: "hover:bg-white/5" },
];

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
    setLoading(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    try {
      await signIn("nodemailer", { email, redirect: false });
      setEmailSent(true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-neon-blue/10 via-transparent to-transparent blur-[120px] pointer-events-none" aria-hidden="true" />
      
      {/* Animated particles decoration */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-neon-blue/30 rounded-full animate-float" aria-hidden="true" />
      <div className="absolute bottom-20 right-20 w-3 h-3 bg-neon-blue/20 rounded-full animate-float" style={{ animationDelay: "-2s" }} aria-hidden="true" />
      <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-float" style={{ animationDelay: "-4s" }} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="w-full p-8 space-y-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center space-y-2"
          >
            <motion.h1 variants={fadeInUp} className="text-3xl font-bold tracking-tighter">Welcome to Aether</motion.h1>
            <motion.p variants={fadeInUp} className="text-neutral-500">Sign in to your autonomous workspace</motion.p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {oauthProviders.map((provider) => (
              <motion.button
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 * oauthProviders.indexOf(provider) }}
                onClick={() => handleOAuthSignIn(provider.id)}
                disabled={loading !== null}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl glass border border-white/5 hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-neon-blue focus-visible:outline-offset-2"
                aria-label={`Sign in with ${provider.label}`}
              >
                {loading === provider.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <provider.icon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{provider.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="relative" role="separator" aria-orientation="horizontal">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A0A0A] px-2 text-neutral-500">Or continue with email</span>
            </div>
          </div>

          {emailSent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-neon-blue" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Check your inbox</h3>
                <p className="text-sm text-neutral-500">We sent a magic link to <span className="text-neutral-300 font-mono">{email}</span></p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-input" className="sr-only">Email address</label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all duration-200"
                  required
                  autoComplete="email"
                  aria-label="Email address"
                />
              </div>
              <NeonButton type="submit" className="w-full py-3" loading={loading === "email"} disabled={loading !== null}>
                Send Magic Link
              </NeonButton>
            </form>
          )}

          <p className="text-center text-xs text-neutral-600">
            Don&apos;t have an account? <Link href="/register" className="text-neon-blue hover:underline focus-visible:outline-2 focus-visible:outline-neon-blue rounded" aria-label="Create an account">Register</Link>
          </p>
          <p className="text-center text-[10px] text-neutral-700">
            By continuing, you agree to Aether&apos;s Terms of Service and Privacy Policy.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}