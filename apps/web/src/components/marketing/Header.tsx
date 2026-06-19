"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { NeonButton } from "@aether/ui";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.8)"]
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
  ];

  return (
    <motion.header
      style={{ backgroundColor: headerBg, borderBottomColor: headerBorder }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-neon-blue rounded-lg flex items-center justify-center font-bold text-black group-hover:rotate-12 transition-transform">
            &AElig;
          </div>
          <span className="font-bold text-xl tracking-tighter">AETHER</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            <ThemeToggle />
            <Link href="/login">
              <NeonButton variant="ghost" size="sm">
                Login
              </NeonButton>
            </Link>
            <Link href="/register">
              <NeonButton size="sm">
                Join Beta
              </NeonButton>
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-400 hover:text-white"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-0 right-0 bg-black border-b border-white/10 p-4 space-y-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-lg font-medium text-neutral-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-4">
            <Link href="/login" className="w-full">
              <NeonButton variant="ghost" className="w-full">
                Login
              </NeonButton>
            </Link>
            <Link href="/register" className="w-full">
              <NeonButton className="w-full">
                Join Beta
              </NeonButton>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
