"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Search, 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  MoreHorizontal, 
  Paperclip, 
  Menu, 
  X, 
  ChevronRight,
  Inbox,
  Star,
  Send,
  FileText,
  Trash
} from "lucide-react";

// ==========================================
// 1. Shared Primitives
// ==========================================

export function AppleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" fill="currentColor" />
    </svg>
  );
}

export function AppleButton({ label = "Download Aura", full = false }: { label?: string; full?: boolean }) {
  return (
    <button className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] cursor-pointer ${full ? "w-full" : ""}`}>
      <AppleLogo className="w-4 h-4 fill-current text-black" />
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[1px]" />
    </button>
  );
}

export function SectionEyebrow({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      <span className="text-xs uppercase tracking-widest text-white font-medium">{label}</span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-[10px] font-mono">
          {tag}
        </span>
      )}
    </div>
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
// 2. Data Types & Assets
// ==========================================

interface Message {
  id: string;
  name: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  active: boolean;
  avatarLetter: string;
  category: string;
  body: string[];
  summary: string;
  attachment?: string;
}

const mockMessages: Message[] = [
  {
    id: "linear",
    name: "Linear",
    subject: "Weekly product digest",
    preview: "Your team shipped 23 issues this week...",
    time: "9:41 AM",
    unread: true,
    active: true,
    avatarLetter: "L",
    category: "Work",
    body: [
      "Hi team,",
      "Here is your weekly digest of everything happening across your projects. This was a strong week with significant progress on the Q3 roadmap.",
      "Twenty-three issues were closed, fourteen pull requests were merged, and two customer-facing features went out. The velocity trend continues to climb.",
      "Let me know if you would like a deeper breakdown by project or contributor.",
      "— The Linear team"
    ],
    summary: "Your team closed 23 issues, merged 14 PRs, and shipped 2 features. Top contributor: Marcus. No action needed.",
    attachment: "digest-may-6.pdf"
  },
  {
    id: "sophia",
    name: "Sophia Chen",
    subject: "Re: Q3 roadmap review",
    preview: "Thanks for sending the deck over. I had a few thoughts...",
    time: "8:12 AM",
    unread: true,
    active: false,
    avatarLetter: "S",
    category: "Work",
    body: [
      "Hi Aura Team,",
      "Thanks for sending the Q3 roadmap deck over. I had a few thoughts on the design direction for the mobile application. The main priority should be offline support.",
      "Let's jump on a sync tomorrow at 10 AM EST if you are free. I'll send an invite.",
      "Best,",
      "Sophia"
    ],
    summary: "Sophia reviewed the roadmap deck and suggested prioritizing mobile offline support. She is scheduling a sync for tomorrow at 10 AM."
  },
  {
    id: "figma",
    name: "Figma",
    subject: "Marcus commented on your file",
    preview: "Love the new direction on the landing hero.",
    time: "Yesterday",
    unread: false,
    active: false,
    avatarLetter: "F",
    category: "Personal",
    body: [
      "Marcus commented on Aura landing page v2:",
      "\"Love the new direction on the landing hero. The glass effects look incredible. Let's make sure the background video loads instantly.\"",
      "Click to view comment and reply."
    ],
    summary: "Marcus left feedback praising the landing page hero's glass effects, emphasizing instant background video loading."
  },
  {
    id: "stripe",
    name: "Stripe",
    subject: "Payout of $12,480.00 sent",
    preview: "Your payout is on its way to your bank...",
    time: "Yesterday",
    unread: false,
    active: false,
    avatarLetter: "S",
    category: "Finance",
    body: [
      "Hello,",
      "A payout of $12,480.00 is now on its way to your bank account. It should arrive within 2-3 business days depending on your bank's processing times.",
      "Transaction ID: tx_98372498234."
    ],
    summary: "A payout of $12,480.00 is processed and will arrive in your bank account in 2-3 business days."
  },
  {
    id: "vercel",
    name: "Vercel",
    subject: "Deployment ready for aura-web",
    preview: "Preview is live at aura-web-g3f.vercel.app",
    time: "Mon",
    unread: false,
    active: false,
    avatarLetter: "V",
    category: "Work",
    body: [
      "Your project aura-web has been successfully deployed.",
      "Branch: main",
      "Preview URL: https://aura-web-g3f.vercel.app",
      "Console: https://vercel.com/aura/aura-web/deployments"
    ],
    summary: "Deployment of aura-web from main branch succeeded. Preview URL is live."
  },
  {
    id: "github",
    name: "GitHub",
    subject: "[aura/core] PR #482 approved",
    preview: "david-lim approved your pull request.",
    time: "Mon",
    unread: false,
    active: false,
    avatarLetter: "G",
    category: "Work",
    body: [
      "david-lim approved pull request #482: 'feat: add ai triage integration hooks'.",
      "All checks passed. Ready for merge."
    ],
    summary: "PR #482 containing AI triage integration hooks was approved by david-lim. Checks are passing."
  }
];

// ==========================================
// 3. Component Definition
// ==========================================

export function AuraLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState("linear");
  const [yearlyPricing, setYearlyPricing] = useState(true);

  const activeMessage = mockMessages.find(m => m.id === selectedMessageId) || mockMessages[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white font-sans selection:bg-[#3D81E3]/30 antialiased">
      {/* 1. Fullscreen video background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-60 pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" 
        />
      </div>

      {/* 2. Fixed grid guides */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* 3. Global SVG noise filter at root level */}
      <svg className="hidden">
        <defs>
          <filter id="c3-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" result="noise" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* Main Container */}
      <div className="relative z-10">

        {/* ==========================================
            Section 1 — Navbar
            ========================================== */}
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full border-b border-white/5 bg-black/10 backdrop-blur-md sticky top-0 z-50"
        >
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Left: LogoMark only */}
            <div className="flex items-center">
              <LogoMark className="w-8 h-8 text-white hover:opacity-85 transition-opacity" />
            </div>

            {/* Center: Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {['Solutions', 'Pricing', 'Blog', 'Documentation', 'Careers'].map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                  className="text-white/70 text-sm font-medium hover:text-white transition-colors duration-200"
                >
                  {link}
                </motion.a>
              ))}
            </div>

            {/* Right: Desktop download button */}
            <div className="hidden md:flex items-center">
              <AppleButton label="Download Aura" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white active:scale-95 transition-transform"
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
                className="md:hidden border-t border-white/10 bg-[#0c0c0c]/95 backdrop-blur-xl overflow-hidden"
              >
                <div className="px-6 py-6 flex flex-col gap-4">
                  {['Solutions', 'Pricing', 'Blog', 'Documentation', 'Careers'].map((link) => (
                    <a 
                      key={link} 
                      href={`#${link.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white/80 hover:text-white text-base py-2 font-medium"
                    >
                      {link}
                    </a>
                  ))}
                  <div className="pt-4 border-t border-white/5">
                    <AppleButton label="Download Aura" full />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ==========================================
            Section 2 — Hero
            ========================================== */}
        <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center">
          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl font-semibold tracking-tight leading-[1.0] select-none"
          >
            <span className="block text-white mb-2 md:mb-4">Your email.</span>
            <span 
              className="inline-block animate-shiny pb-2" 
              style={gradientStyle}
            >
              Revitalized
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
          >
            Aura is the premier inbox platform for the current era. It leverages powerful AI to organize, prioritize, and refine your messages into total clarity.
          </motion.p>

          {/* Action buttons & Platform labels */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <AppleButton label="Download Aura" />
            <span className="text-xs text-white/40 font-mono tracking-wider">
              Download for Intel / Apple Silicon
            </span>
          </motion.div>
        </section>

        {/* ==========================================
            Section 3 — macOS Menu Bar Strip
            ========================================== */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-full bg-black/40 backdrop-blur-md border-t border-b border-white/10"
        >
          <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-between text-xs font-medium text-white/70 select-none">
            {/* Left: Apple mark + bold name + menu links */}
            <div className="flex items-center gap-4">
              <AppleLogo className="w-3.5 h-3.5 text-white fill-current" />
              <span className="font-semibold text-white">Aura</span>
              <div className="flex items-center gap-3">
                {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((item, index) => {
                  let responsiveClass = "";
                  if (index > 2) responsiveClass = "hidden sm:inline";
                  if (index > 3) responsiveClass = "hidden md:inline";
                  return (
                    <span 
                      key={item} 
                      className={`hover:text-white cursor-default ${responsiveClass}`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Right: Search and Time info */}
            <div className="flex items-center gap-3 text-white/60">
              <Search className="w-3.5 h-3.5 text-white" />
              <span>Wed May 6 1:09 PM</span>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            Section 4 — Inbox Mockup
            ========================================== */}
        <section id="solutions" className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl"
          >
            {/* Title Bar */}
            <div className="h-10 bg-black/20 border-b border-white/5 flex items-center px-4 justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="text-xs text-white/50 font-medium">Aura — Inbox</div>
              <div className="w-12" /> {/* spacer to balance lights */}
            </div>

            {/* App Body Grid */}
            <div className="grid grid-cols-12 md:h-[520px] divide-x divide-white/5 text-sm">
              {/* Columns: Sidebar (3/12), Msg List (4/12), Reader (5/12) */}

              {/* A. Sidebar (col-span-3) */}
              <div className="col-span-12 md:col-span-3 bg-black/30 p-4 flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col gap-5">
                  {/* Compose with Aura button */}
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2.5 hover:bg-white/90 transition-colors cursor-pointer active:scale-95">
                    <Sparkles className="w-3.5 h-3.5 text-black fill-current" />
                    <span>Compose with Aura</span>
                  </button>

                  {/* Sidebar Nav */}
                  <div className="flex flex-col gap-0.5">
                    {[
                      { icon: Inbox, label: "Inbox", count: 12, key: "inbox" },
                      { icon: Star, label: "Starred", count: 3, key: "starred" },
                      { icon: Send, label: "Sent", key: "sent" },
                      { icon: FileText, label: "Drafts", count: 2, key: "drafts" },
                      { icon: Archive, label: "Archive", key: "archive" },
                      { icon: Trash, label: "Trash", key: "trash" }
                    ].map((item) => {
                      const isActive = item.key === "inbox";
                      const Icon = item.icon;
                      return (
                        <div 
                          key={item.key}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isActive ? "bg-white/10 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.count && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                              isActive ? "bg-white/10 text-white" : "bg-white/5 text-white/40"
                            }`}>
                              {item.count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Labels Section */}
                <div className="mt-8">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 select-none">
                    Labels
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {[
                      { label: "Work", color: "#00d2ff" },
                      { label: "Personal", color: "#A4F4FD" },
                      { label: "Travel", color: "#f59e0b" },
                      { label: "Finance", color: "#10b981" }
                    ].map((label) => (
                      <div key={label.label} className="flex items-center gap-2.5 px-3 py-1.5 text-white/60 hover:text-white cursor-pointer rounded-lg hover:bg-white/5 transition-colors">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
                        <span className="text-xs">{label.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* B. Message List (col-span-4) */}
              <div className="col-span-12 md:col-span-4 flex flex-col bg-black/15 overflow-hidden border-t md:border-t-0">
                {/* Search Bar header */}
                <div className="p-3 border-b border-white/5 flex items-center gap-2 text-white/40 focus-within:text-white/80 transition-colors">
                  <Search className="w-4 h-4 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search mail"
                    className="w-full bg-transparent border-none text-white text-xs outline-none placeholder:text-white/30"
                  />
                </div>

                {/* Message Rows */}
                <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[300px] md:max-h-none">
                  {mockMessages.map((msg) => {
                    const isSelected = msg.id === selectedMessageId;
                    return (
                      <div 
                        key={msg.id}
                        onClick={() => setSelectedMessageId(msg.id)}
                        className={`p-3.5 flex flex-col gap-1 cursor-pointer transition-all ${
                          isSelected ? "bg-white/5 border-l-2 border-brand" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white/90 text-xs">{msg.name}</span>
                          <span className="text-[10px] text-white/40 font-mono">{msg.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                          <span className={`truncate text-xs ${msg.unread ? "text-white font-medium" : "text-white/70"}`}>
                            {msg.subject}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/45 truncate leading-relaxed">
                          {msg.preview}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C. Reader view (col-span-5) */}
              <div className="col-span-12 md:col-span-5 flex flex-col overflow-y-auto border-t md:border-t-0">
                {/* Reader toolbar */}
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-black/10 select-none">
                  <div className="flex items-center gap-1">
                    {[
                      { icon: Reply, label: "Reply" },
                      { icon: Forward, label: "Forward" },
                      { icon: Archive, label: "Archive" },
                      { icon: Trash2, label: "Delete" }
                    ].map((btn) => {
                      const Icon = btn.icon;
                      return (
                        <button 
                          key={btn.label}
                          className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                          title={btn.label}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                  <button className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Email Header */}
                <div className="p-5 border-b border-white/5 flex flex-col gap-3">
                  <h2 className="text-base font-semibold text-white tracking-tight leading-tight">
                    {activeMessage.subject}
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center text-white text-xs font-semibold">
                        {activeMessage.avatarLetter}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white">{activeMessage.name}</span>
                        <span className="text-[10px] text-white/40">to me · {activeMessage.time}</span>
                      </div>
                    </div>
                    {/* Work / category pill */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 bg-white/5 text-white/80">
                      {activeMessage.category}
                    </span>
                  </div>
                </div>

                {/* Email Content */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* AI Summary Card */}
                  <div className="liquid-glass rounded-xl p-3.5 text-xs flex flex-col gap-1.5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-[#A4F4FD] font-semibold">
                      <Sparkles className="w-3.5 h-3.5 fill-current text-[#A4F4FD]" />
                      <span>Summary by Aura</span>
                    </div>
                    <p className="text-white/80 leading-relaxed font-normal">
                      {activeMessage.summary}
                    </p>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="flex flex-col gap-3 text-xs leading-relaxed text-white/80 font-normal">
                    {activeMessage.body.map((para, idx) => (
                      <p key={idx} className={para.startsWith("—") ? "text-white/50 font-medium" : ""}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Attachment */}
                  {activeMessage.attachment && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-colors cursor-pointer select-none">
                        <Paperclip className="w-3.5 h-3.5 text-white/50" />
                        <span className="font-mono text-[11px]">{activeMessage.attachment}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ==========================================
            Section 5 — FeatureTriage
            ========================================== */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left Info Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col"
            >
              <SectionEyebrow label="Triage" tag="AI-native" />
              <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02] text-white">
                Clear your inbox <br/> in a single pass.
              </h2>
              <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md font-normal">
                Aura reads every message, understands intent, and routes the noise away from the signal. Focus on what moves your day forward — the rest handles itself.
              </p>
              {/* Chips Row */}
              <div className="mt-8 flex flex-wrap gap-2">
                {["Auto-categorize", "Snooze for later", "Silent newsletters", "One-tap unsubscribe"].map((chip) => (
                  <span 
                    key={chip}
                    className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right Card Column */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="liquid-glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4"
            >
              {/* Card Title */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5 select-none">
                <span className="text-xs font-semibold text-white/80">Today · 42 messages triaged</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              </div>

              {/* Sub-cards */}
              {[
                { 
                  title: "Priority", 
                  count: 4, 
                  color: "#ffffff", 
                  items: ["Sophia Chen — Q3 review", "David Lim — contract signoff"] 
                },
                { 
                  title: "Follow-up", 
                  count: 7, 
                  color: "#e5e5e5", 
                  items: ["Marcus — design review", "Figma — comment thread"] 
                },
                { 
                  title: "Updates", 
                  count: 18, 
                  color: "#a3a3a3", 
                  items: ["Vercel — deploy ready", "GitHub — PR #482 merged"] 
                },
                { 
                  title: "Archived", 
                  count: 13, 
                  color: "#525252", 
                  items: ["Stripe payout · Newsletter · Receipts"] 
                }
              ].map((subCard) => (
                <div key={subCard.title} className="liquid-glass rounded-lg p-3 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subCard.color }} />
                      <span className="text-xs font-semibold text-white">{subCard.title}</span>
                      <span className="text-[10px] text-white/40">({subCard.count})</span>
                    </div>
                    <div className="text-[11px] text-white/60 leading-relaxed">
                      {subCard.items.join("  ·  ")}
                    </div>
                  </div>
                  <span className="text-white/40 text-xs flex items-center justify-center h-5 w-5 bg-white/5 rounded-full">
                    {subCard.count}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ==========================================
            Section 6 — LogoCloud
            ========================================== */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 border-t border-white/5">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-white/40 font-mono font-medium">
              Trusted by the world's most thoughtful teams
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center items-center">
            {['Linear', 'Vercel', 'Figma', 'Stripe', 'Ramp', 'Notion', 'Loom', 'Arc'].map((name, idx) => (
              <motion.span
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="text-sm font-semibold tracking-tight text-white/50 hover:text-white cursor-pointer select-none transition-colors duration-200"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ==========================================
            Section 7 — Testimonials
            ========================================== */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Aura gave our leadership team four hours of their week back. It reads like email from the future.",
                author: "Parker Wilf",
                role: "Group Product Manager",
                company: "MERCURY"
              },
              {
                quote: "The command palette alone has changed how I process messages. I can't imagine going back to a traditional client.",
                author: "Andrew von Rosenbach",
                role: "Senior Engineering Program Manager",
                company: "COHERE"
              },
              {
                quote: "Triage that actually understands context. Our team stopped dreading Monday morning inboxes.",
                author: "Mathies Christensen",
                role: "Engineering Manager",
                company: "LUNAR"
              }
            ].map((t, i) => (
              <motion.figure 
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="liquid-glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between"
              >
                <blockquote className="text-sm text-white/80 leading-[1.6] font-normal italic">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-1 select-none">
                  <span className="text-sm font-semibold text-white">{t.author}</span>
                  <span className="text-xs text-white/50">{t.role}</span>
                  <span className="text-xs text-brand font-semibold tracking-wider uppercase mt-1">
                    {t.company}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        {/* ==========================================
            Section 8 — Pricing
            ========================================== */}
        <section id="pricing" className="c3-pricing-section">
          {/* Noise filter container */}
          <svg className="hidden">
            <defs>
              <filter id="c3-noise-pricing">
                <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" stitchTiles="stitch" />
                <feComponentTransfer><feFuncA type="linear" slope="0.075" /></feComponentTransfer>
                <feComposite in2="SourceGraphic" operator="in" result="noise" />
                <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
              </filter>
            </defs>
          </svg>

          {/* Watermark header */}
          <div className="c3-watermark-container select-none">
            <div className="c3-watermark-main" style={{ filter: "url(#c3-noise-pricing)" }}>
              <span className="c3-watermark-line-1">Your email.</span>
              <span className="c3-watermark-line-2">Revitalized</span>
            </div>
          </div>

          {/* Toggle wrap */}
          <div className="c3-toggle-wrap font-sans text-xs">
            <span className="text-white/60 font-semibold tracking-widest uppercase">Yearly Billing (Save 15%)</span>
            <button 
              onClick={() => setYearlyPricing(!yearlyPricing)}
              className={`c3-toggle ${yearlyPricing ? "active" : ""}`}
              aria-label="Toggle pricing cycle"
            >
              <span className="c3-toggle-knob" />
            </button>
          </div>

          {/* 3 Tier Grid */}
          <div className="c3-grid">
            {/* Free tier */}
            <div className="c3-card">
              <span className="c3-tier-small">Free</span>
              <span className="c3-tier-large">Free</span>
              <p className="c3-desc">
                For creators taking their first steps with Forma.
              </p>
              <ul className="c3-list">
                {[
                  "Up to 3 projects in the cloud",
                  "Image export up to 1080p",
                  "Basic editing tools",
                  "Free templates and icons",
                  "Access via web and mobile app"
                ].map((f) => (
                  <li key={f}>
                    <span className="c3-check">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="c3-btn cursor-pointer">Choose Plan</button>
            </div>

            {/* Standard tier */}
            <div className="c3-card">
              <span className="c3-tier-small">Standard</span>
              <span className="c3-tier-large">{yearlyPricing ? "$99,99/y" : "$9,99/m"}</span>
              <p className="c3-desc">
                For freelancers and small teams who need more freedom and flexibility.
              </p>
              <ul className="c3-list">
                {[
                  "Up to 50 projects in the cloud",
                  "Export up to 4K",
                  "Advanced editing toolkit",
                  "Team collaboration (up to 5 members)",
                  "Access to premium template library"
                ].map((f) => (
                  <li key={f}>
                    <span className="c3-check">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="c3-btn cursor-pointer">Choose Plan</button>
            </div>

            {/* Pro tier */}
            <div className="c3-card c3-card-pro border-[#22d3ee]/50">
              <span className="c3-tier-small">Pro</span>
              <span className="c3-tier-large">{yearlyPricing ? "$199,99/y" : "$19,99/m"}</span>
              <p className="c3-desc">
                For studios, agencies, and professional creators working with brands.
              </p>
              <ul className="c3-list">
                {[
                  "Unlimited projects",
                  "Export up to 8K + animations",
                  "AI-powered content generation tools",
                  "Unlimited team members",
                  "Brand customization"
                ].map((f) => (
                  <li key={f}>
                    <span className="c3-check">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="c3-btn cursor-pointer bg-brand text-white border-none hover:bg-brand/90 hover:text-white">Choose Plan</button>
            </div>
          </div>
        </section>

        {/* ==========================================
            Section 9 — FinalCTA
            ========================================== */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center border border-white/5"
          >
            {/* Radial Glow Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
              style={{
                background: "radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)"
              }}
            />

            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02] text-white">
              Close the tabs. <br/> Open your day.
            </h2>
            
            <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6] font-normal">
              Join thousands of builders, founders, and operators who treat email like a tool — not an obligation.
            </p>

            {/* Buttons Group */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <AppleButton label="Download Aura" />
              <button className="group rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                <span>Talk to sales</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[1px]" />
              </button>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
