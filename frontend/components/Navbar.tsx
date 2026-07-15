"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "@/components/WalletButton";
import { LogoMark } from "@/components/landing/aura-landing";

export default function Navbar() {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 left-0 right-0 z-40 px-6">
      <div className="max-w-[1000px] mx-auto h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="no-underline flex items-center gap-2">
            <LogoMark className="w-8 h-8 text-white hover:opacity-85 transition-opacity" />
            <span className="font-bold tracking-tight text-white hidden sm:inline-block">StellarSwap</span>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/swap"
            className={`text-sm font-medium no-underline transition-colors ${
              isLinkActive("/swap")
                ? "text-white border-b border-white pb-1"
                : "text-white/70 hover:text-white"
            }`}
          >
            Swap
          </Link>
          <Link
            href="/liquidity"
            className={`text-sm font-medium no-underline transition-colors ${
              isLinkActive("/liquidity")
                ? "text-white border-b border-white pb-1"
                : "text-white/70 hover:text-white"
            }`}
          >
            Liquidity
          </Link>
          <Link
            href="/portfolio"
            className={`text-sm font-medium no-underline transition-colors ${
              isLinkActive("/portfolio")
                ? "text-white border-b border-white pb-1"
                : "text-white/70 hover:text-white"
            }`}
          >
            Portfolio
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
