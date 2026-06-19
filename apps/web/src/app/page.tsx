"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { GlassCard, NeonButton } from "@aether/ui";
import Link from "next/link";
import { ParticleBackground } from "@/components/marketing/ParticleBackground";
import { CodeRain } from "@/components/marketing/CodeRain";
import { FloatingTerminal } from "@/components/marketing/FloatingTerminal";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { Header } from "@/components/marketing/Header";
import { FAQSection } from "@/components/marketing/FAQSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { Footer } from "@/components/marketing/Footer";
import { Benefits } from "@/components/marketing/Benefits";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Testimonials } from "@/components/marketing/Testimonials";
import { useRef, useState, useEffect } from "react";
import { 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Code2, 
  Cpu,
  ArrowRight,
  Terminal as TerminalIcon
} from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Aether",
  "operatingSystem": "Browser-based",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "AI-native autonomous engineering operating system that builds, deploys, and scales software from natural language."
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function CountUp({ end, suffix = "", duration = 2000 }: { end: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsInView(true),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const target = parseInt(end.replace(/[^0-9]/g, ""));
    if (isNaN(target)) { setCount(end); return; }

    let startTime: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target).toLocaleString());
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-4xl font-bold text-neon-blue tabular-nums">
      {count}{suffix}
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <ParticleBackground />
      <CodeRain />
      <div className="noise-overlay fixed inset-0 z-10 pointer-events-none" />
      
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 z-20">
        <motion.div 
          style={{ opacity, scale }}
          className="text-center space-y-12 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-6xl font-extrabold tracking-tighter sm:text-8xl md:text-9xl leading-none">
              Build entire <br />
              <span className="text-gradient">companies</span> with AI.
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-500 max-w-2xl mx-auto font-light leading-relaxed">
              Aether is the world&apos;s first autonomous engineering operating system. 
              One prompt to design, build, deploy, and scale.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/register">
              <NeonButton className="text-lg px-10 py-6 group">
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </NeonButton>
            </Link>
            <a href="#demo">
              <button className="text-neutral-500 hover:text-foreground transition-colors font-medium border border-white/10 px-10 py-6 rounded-full glass-hover flex items-center gap-2">
                <TerminalIcon className="w-5 h-5" />
                Watch Demo
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 hidden xl:block"
        >
           <FloatingTerminal />
        </motion.div>
      </section>

      {/* Social Proof Marquee */}
      <SocialProof />

      {/* Benefits Section */}
      <Benefits />

      {/* Interactive Demo Section */}
      <section id="demo" className="relative z-20 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Autonomous Workforce in Action</h2>
          <p className="text-neutral-500">Watch our agents coordinate to build a production-ready application from scratch.</p>
        </div>
        <InteractiveDemo />
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 px-4 max-w-7xl mx-auto z-20 relative">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Engineered for the Future.</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">Everything you need to go from idea to global scale, handled by AI.</p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Main Feature */}
          <motion.div variants={fadeInUp} className="md:col-span-8">
            <GlassCard className="h-full flex flex-col justify-between overflow-hidden group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-neon-blue/10 rounded-xl flex items-center justify-center text-neon-blue">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Full-Stack Autonomy</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Our agents don&apos;t just write code. They design architectures, provision databases, configure CI/CD, and manage infrastructure.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-neutral-500">React 19</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-neutral-500">Next.js 15</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-neutral-500">PostgreSQL</span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="md:col-span-4">
            <GlassCard className="h-full flex flex-col justify-center text-center p-8 border-neon-blue/20 group hover:border-neon-blue transition-colors">
              <Shield className="w-12 h-12 text-neon-blue mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-4">Secure Sandboxes</h3>
              <p className="text-sm text-neutral-400">
                Firecracker microVMs ensure agent code is tested in complete isolation.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="md:col-span-4">
            <GlassCard className="h-full flex flex-col justify-between group hover:bg-white/5 transition-colors">
              <Zap className="w-8 h-8 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-bold mb-2">One-Click Deploy</h3>
                <p className="text-sm text-neutral-400">Preview URLs for every change, global CDN, and edge function support.</p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="md:col-span-8">
            <GlassCard className="h-full flex items-center gap-8 overflow-hidden group">
              <div className="flex-1 space-y-4">
                <Globe className="w-8 h-8 text-neon-blue group-hover:rotate-12 transition-transform" />
                <h3 className="text-2xl font-bold">Repo Intelligence</h3>
                <p className="text-neutral-400">Understands entire codebases, suggests refactors, generates docs, and opens PRs autonomously.</p>
              </div>
              <div className="hidden lg:block w-48 h-48 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-colors" />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="md:col-span-6">
            <GlassCard className="flex items-start gap-6 hover:border-white/20 transition-colors">
              <Users className="w-10 h-10 text-blue-400 shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
                <p className="text-sm text-neutral-400">Watch specialized agents coordinate in real-time. Invite your team to pair with AI.</p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp} className="md:col-span-6">
            <GlassCard className="flex items-start gap-6 hover:border-white/20 transition-colors">
              <Code2 className="w-10 h-10 text-neon-blue shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">AI Code Review</h3>
                <p className="text-sm text-neutral-400">Every line of code is reviewed for security, performance, and best practices automatically.</p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </section>

      {/* Metrics Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01] relative z-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <CountUp end="50000" suffix="+" />
            <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Apps Deployed</div>
          </div>
          <div className="space-y-2">
            <CountUp end="1000000" suffix="+" />
            <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Tasks Automated</div>
          </div>
          <div className="space-y-2">
            <CountUp end="500000000" suffix="+" />
            <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Tokens Processed</div>
          </div>
          <div className="space-y-2">
            <CountUp end="10000" suffix="+" />
            <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Developers</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-32 px-4 text-center space-y-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-neon-blue/10 border border-neon-blue/20 rounded-3xl p-12 md:p-24 max-w-5xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/20 rounded-full blur-[120px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to build the future?</h2>
            <p className="text-xl text-neutral-400 max-w-xl mx-auto">
              Join 10,000+ developers building autonomous software on Aether.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <NeonButton className="text-xl px-12 py-8 w-full sm:w-auto">
                  Initialize Your Workspace
                </NeonButton>
              </Link>
              <Link href="/pricing">
                <button className="text-white font-medium border border-white/10 px-12 py-8 rounded-2xl glass-hover w-full sm:w-auto">
                  View Plans
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* Global Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,174,255,0.01)_50%)] bg-[size:100%_4px] z-50 opacity-10" />
    </main>
  );
}
