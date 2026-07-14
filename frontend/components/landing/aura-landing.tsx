"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  ChevronRight,
  Layers,
  ShieldAlert
} from "lucide-react";

// ==========================================
// 1. Shared Primitives (DEX Navbar & Hero)
// ==========================================

export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" fill="currentColor" />
    </svg>
  );
}

export function ActionButton({ label, full = false }: { label: string; full?: boolean }) {
  return (
    <button className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] cursor-pointer ${full ? "w-full" : ""}`}>
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[1px]" />
    </button>
  );
}

const gradientStyle: React.CSSProperties = {
  backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise)'
};

// ==========================================
// 2. Component Definition
// ==========================================

export function AuraLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Xero Animation State
  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeStackRef = useRef<HTMLDivElement>(null);
  const nodeXRef = useRef<HTMLDivElement>(null);
  const nodeShieldRef = useRef<HTMLDivElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const corePathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  const [beamOpacity, setBeamOpacity] = useState(1);
  const [nodeStackActive, setNodeStackActive] = useState(false);
  const [nodeShieldActive, setNodeShieldActive] = useState(false);
  const [splashActive, setSplashActive] = useState(false);

  useEffect(() => {
    // Apply body style classes for Xero layout
    document.body.classList.add("xero-body");

    const recomputePath = () => {
      const pipeline = pipelineRef.current;
      const nodeStack = nodeStackRef.current;
      const nodeX = nodeXRef.current;
      const nodeShield = nodeShieldRef.current;
      const glowPath = glowPathRef.current;
      const corePath = corePathRef.current;

      if (!pipeline || !nodeStack || !nodeX || !nodeShield || !glowPath || !corePath) return;

      const pRect = pipeline.getBoundingClientRect();
      const sRect = nodeStack.getBoundingClientRect();
      const xRect = nodeX.getBoundingClientRect();
      const shRect = nodeShield.getBoundingClientRect();

      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;

      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;

      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;

      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      glowPath.setAttribute("d", d);
      corePath.setAttribute("d", d);
    };

    recomputePath();
    window.addEventListener("resize", recomputePath);

    let animationFrameId: number;
    let state = "p1"; // p1, splash, p2, idle
    let lastStateChange = performance.now();

    const loop = (timestamp: number) => {
      const elapsed = timestamp - lastStateChange;
      const gradient = gradientRef.current;

      if (state === "p1") {
        if (elapsed >= 800) {
          state = "splash";
          lastStateChange = timestamp;
          setBeamOpacity(0);
          setSplashActive(true);
          setNodeStackActive(false);
        } else {
          const progress = elapsed / 800;
          const percentage = progress * 0.5;
          const center = percentage * 100;
          if (gradient) {
            gradient.setAttribute("x1", `${center - 5}%`);
            gradient.setAttribute("x2", `${center + 5}%`);
          }
          if (percentage < 0.4) {
            setNodeStackActive(true);
          } else {
            setNodeStackActive(false);
          }
        }
      } else if (state === "splash") {
        if (elapsed >= 800) {
          state = "p2";
          lastStateChange = timestamp;
          setBeamOpacity(1);
          setSplashActive(false);
        }
      } else if (state === "p2") {
        if (elapsed >= 800) {
          state = "idle";
          lastStateChange = timestamp;
          setNodeShieldActive(false);
        } else {
          const progress = elapsed / 800;
          const percentage = 0.5 + progress * 0.5;
          const center = percentage * 100;
          if (gradient) {
            gradient.setAttribute("x1", `${center - 5}%`);
            gradient.setAttribute("x2", `${center + 5}%`);
          }
          if (percentage > 0.6) {
            setNodeShieldActive(true);
          } else {
            setNodeShieldActive(false);
          }
        }
      } else if (state === "idle") {
        if (elapsed >= 1000) {
          state = "p1";
          lastStateChange = timestamp;
        }
      }

      recomputePath();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("xero-body");
      window.removeEventListener("resize", recomputePath);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ==========================================
          Section 1 — Existing Navbar (DEX)
          ========================================== */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[1600px] border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 left-0 right-0 z-50 px-6"
      >
        <div className="w-full h-20 flex items-center justify-between">
          {/* Left: LogoMark only */}
          <div className="flex items-center">
            <LogoMark className="w-8 h-8 text-white hover:opacity-85 transition-opacity" />
          </div>

          {/* Center: Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Swap', href: '/swap' },
              { name: 'Liquidity', href: '/liquidity' },
              { name: 'Portfolio', href: '/portfolio' }
            ].map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: "easeOut" }}
              >
                <Link
                  href={link.href}
                  className="text-white/70 text-sm font-medium hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right: Desktop connect button */}
          <div className="hidden md:flex items-center">
            <ActionButton label="Wallet Connect" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {[
                  { name: 'Swap', href: '/swap' },
                  { name: 'Liquidity', href: '/liquidity' },
                  { name: 'Portfolio', href: '/portfolio' }
                ].map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white/80 hover:text-white text-base py-2 font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/5">
                  <ActionButton label="Wallet Connect" full />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ==========================================
          Section 2 — Xero Hero Card with DEX Data
          ========================================== */}
      <section className="hero-card select-none">
        {/* Radial grid background */}
        <div className="hero-grid" />

        {/* Animated centerpiece (icon pipeline) */}
        <div className="icon-pipeline" ref={pipelineRef}>
          {/* Animated beam SVG */}
          <svg className="beam-svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="SourceGraphic" operator="over" />
              </filter>
              <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse" ref={gradientRef}>
                <stop offset="0%" stopColor="#3D81E3" stopOpacity="0" />
                <stop offset="20%" stopColor="#3D81E3" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#00d2ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00d2ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path ref={glowPathRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="2" filter="url(#glow)" opacity={0.6 * beamOpacity} />
            <path ref={corePathRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="0.8" opacity={beamOpacity} />
          </svg>

          {/* Left Node (layers) */}
          <div 
            ref={nodeStackRef}
            id="node-stack"
            className={`icon-node node-light-right ${nodeStackActive ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          {/* Left Line */}
          <div className="pipeline-line" />

          {/* Center Node (Xero logo X) */}
          <div className="relative">
            <div 
              ref={splashRef}
              className={`splash ${splashActive ? "animate" : ""}`} 
            />
            <div 
              ref={nodeXRef}
              id="node-x"
              className="icon-node-center"
            >
              {/* Xero "X" logoipsum multi-cut SVG */}
              <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 10 L18 10 L22 17 L20 19 Z" />
                <path d="M22 21 L20 23 L12 30 L18 30 Z" />
                <path d="M28 10 L22 10 L18 17 L20 19 Z" />
                <path d="M18 21 L20 23 L28 30 L22 30 Z" />
              </svg>
            </div>
          </div>

          {/* Right Line */}
          <div className="pipeline-line right" />

          {/* Right Node (shield check) */}
          <div 
            ref={nodeShieldRef}
            id="node-shield"
            className={`icon-node node-light-left ${nodeShieldActive ? "active" : ""}`}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </div>

        {/* Hero text */}
        <div className="hero-content">
          {/* Small label above */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3D81E3] animate-pulse" />
              Concentrated liquidity, built on Stellar
            </span>
          </div>

          <h1 className="hero-heading">
            The DEX to
            <strong>pool, earn, trade</strong>
          </h1>
          
          <p className="hero-sub">
            Trade with concentrated liquidity, tight spreads, and instant settlement — fully non-custodial on Stellar Soroban.
          </p>
          
          <Link href="/swap" className="btn-cta">
            Launch App
          </Link>
        </div>
      </section>

      {/* ==========================================
          Section 4 — Brands Row
          ========================================== */}
      <div className="brands">
        {/* Expedia */}
        <div className="brand-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path fill="#0a0a0f" d="M8 9h8v2H8zm0 4h6v2H8z" />
          </svg>
          <span>Expedia</span>
        </div>

        {/* asana */}
        <div className="brand-item">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="7" r="4" fill="currentColor" />
            <circle cx="5" cy="16" r="3.5" fill="currentColor" />
            <circle cx="19" cy="16" r="3.5" fill="currentColor" />
          </svg>
          <span>asana</span>
        </div>

        {/* zenefits */}
        <div className="brand-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="4 8 20 8" />
            <polyline points="8 12 16 12" />
            <polyline points="4 16 20 16" />
          </svg>
          <span>zenefits</span>
        </div>

        {/* HubSpot */}
        <div className="brand-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="2" />
            <circle cx="15.5" cy="8.5" r="2.5" fill="currentColor" />
            <path d="M8.5 10.5 L8.5 16 A 1 1 0 0 0 16 16 L 16 11" />
          </svg>
          <span>HubSp<span className="hubspot-dot"></span>t</span>
        </div>

        {/* loom */}
        <div className="brand-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="5.64" y1="5.64" x2="18.36" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="5.64" y2="18.36" />
          </svg>
          <span>loom</span>
        </div>
      </div>
    </div>
  );
}
