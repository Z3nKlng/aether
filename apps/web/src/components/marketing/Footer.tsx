"use client";

import Link from "next/link";
import { MessageSquare, Globe, Code2, ExternalLink } from "lucide-react";

export function Footer() {
  const links = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Changelog", href: "/changelog" },
      { name: "Documentation", href: "/docs" },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-neon-blue rounded-lg flex items-center justify-center font-bold text-black">
                &AElig;
              </div>
              <span className="font-bold text-xl tracking-tighter">AETHER</span>
            </Link>
            <p className="text-neutral-500 max-w-xs text-sm leading-relaxed">
              The world&apos;s first autonomous engineering operating system. Build entire companies from a single prompt.
            </p>
            <div className="flex gap-4">
              {[Globe, Code2, MessageSquare, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-full border border-white/10 text-neutral-500 hover:text-neon-blue hover:border-neon-blue/50 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h4>
              <ul className="space-y-4">
                {items.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-neutral-500 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/5 gap-4">
          <p className="text-xs text-neutral-600 font-mono uppercase tracking-widest">
            &copy; 2024 AETHER OPERATIONS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-neutral-500 font-mono uppercase">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
