"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import WalletButton from "@/components/WalletButton";
import { Menu, X } from "lucide-react";

function LuminaLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      <path d="M16 2L28 8v8l-12 6L4 16V8l12-6z" stroke="url(#logo-grad)" strokeWidth="1.5" fill="none" />
      <path d="M16 6l8 4v5.5L16 20 8 15.5V10l8-4z" fill="url(#logo-grad)" fillOpacity="0.15" stroke="url(#logo-grad)" strokeWidth="1" />
      <circle cx="16" cy="13" r="3" fill="url(#logo-grad)" />
    </svg>
  );
}

// Keep the old export for backward compat with landing page
export { LuminaLogo as LogoMark };

const NAV_LINKS = [
  { href: "/swap", label: "Swap" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/portfolio", label: "Portfolio" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLinkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full sticky top-0 left-0 right-0 z-40"
      style={{
        background: "rgba(6, 6, 11, 0.8)",
        backdropFilter: "blur(20px) saturate(1.2)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-[1200px] mx-auto h-16 flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="no-underline flex items-center gap-2.5 group">
          <LuminaLogo className="w-7 h-7 transition-transform group-hover:scale-105" />
          <span
            className="font-bold tracking-tight text-white text-[15px] hidden sm:inline-block"
            style={{ letterSpacing: "-0.02em" }}
          >
            LuminaDex
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative no-underline px-4 py-2 rounded-lg transition-colors"
                style={{
                  color: active ? "#f0f0f5" : "#6b6b8a",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 500,
                  background: active ? "rgba(124, 92, 255, 0.08)" : "transparent",
                }}
              >
                {link.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c5cff, #00d4ff)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Network Badge + Wallet */}
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase"
            style={{
              border: "1px solid rgba(0, 212, 255, 0.15)",
              background: "rgba(0, 212, 255, 0.05)",
              color: "#00d4ff",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            Testnet
          </span>
          <WalletButton />

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
              color: "#f0f0f5",
            }}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(6, 6, 11, 0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="no-underline px-4 py-3 rounded-lg transition-colors"
                    style={{
                      color: active ? "#f0f0f5" : "#6b6b8a",
                      fontSize: "15px",
                      fontWeight: active ? 600 : 500,
                      background: active ? "rgba(124, 92, 255, 0.08)" : "transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
