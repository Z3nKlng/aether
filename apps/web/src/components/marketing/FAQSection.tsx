"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What exactly is Aether?",
    answer: "Aether is an autonomous engineering platform that uses AI agents to handle the entire software development lifecycle. From architecture design to deployment and scaling, Aether acts as a force multiplier for your engineering needs."
  },
  {
    question: "Is it really free forever?",
    answer: "Yes! Our core features—unlimited projects, deployments, AI chats, and collaboration—are free for everyone. We only monetize on high-performance compute, dedicated enterprise infrastructure, and advanced compliance features."
  },
  {
    question: "Can I use my own models?",
    answer: "Aether supports model routing to all major LLM providers (OpenAI, Anthropic, Gemini). Pro and Enterprise users can configure their own API keys or use our optimized model pool."
  },
  {
    question: "How secure is the execution environment?",
    answer: "Extremely. All agent work happens in isolated, sandboxed Firecracker microVMs. Your code never touches our core infrastructure, and agents are restricted by a strict permissions engine."
  },
  {
    question: "Can it integrate with my existing GitHub repo?",
    answer: "Absolutely. Aether connects seamlessly with GitHub, GitLab, and Bitbucket. It can read your existing codebase, suggest improvements, and even open pull requests autonomously."
  },
  {
    question: "What kind of apps can Aether build?",
    answer: "Aether is optimized for full-stack web applications, SaaS platforms, internal tools, and API services. It can handle frontend (React, Next.js), backend (Node, Go, Python), and database (PostgreSQL, Redis, Vector DBs) orchestration."
  },
  {
    question: "Does Aether support real-time collaboration?",
    answer: "Yes. You can work alongside agents in a real-time browser-based IDE. Changes made by agents appear instantly, and you can intervene, guide, or pair-program with them at any moment."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-4 max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-white/10 rounded-2xl overflow-hidden glass">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-medium">{faq.question}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-5 text-neutral-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
