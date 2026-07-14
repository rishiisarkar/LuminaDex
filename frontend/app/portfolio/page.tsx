"use client";

import React, { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { usePositions } from "@/hooks/usePositions";
import SummaryCards from "@/components/portfolio/SummaryCards";
import ActivityFeed from "@/components/portfolio/ActivityFeed";
import PositionCard from "@/components/liquidity/PositionCard";
import StellarWalletPanel from "@/components/wallet/StellarWalletPanel";
import ContractStatus from "@/components/ContractStatus";
import Link from "next/link";
import WalletButton from "@/components/WalletButton";
import { LogoMark } from "@/components/landing/aura-landing";

export default function PortfolioPage() {
  const { address, connect } = useWallet();
  const { data: positions, isLoading, refetch } = usePositions(address);

  useEffect(() => {
    document.body.classList.add("xero-body");
    return () => {
      document.body.classList.remove("xero-body");
    };
  }, []);

  function handleRefresh() {
    refetch();
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-24 text-white">
      {/* Navbar */}
      <nav className="w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 left-0 right-0 z-40 px-6">
        <div className="max-w-[1000px] mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="no-underline flex items-center gap-2">
              <LogoMark className="w-8 h-8 text-white hover:opacity-85 transition-opacity" />
              <span className="font-bold tracking-tight text-white hidden sm:inline-block">StellarSwap</span>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <Link href="/swap" className="text-white/70 text-sm font-medium hover:text-white no-underline transition-colors">
              Swap
            </Link>
            <Link href="/liquidity" className="text-white/70 text-sm font-medium hover:text-white no-underline transition-colors">
              Liquidity
            </Link>
            <Link href="/portfolio" className="text-white text-sm font-medium border-b border-white pb-1 no-underline">
              Portfolio
            </Link>
          </div>

          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div
        className="w-full max-w-[1000px] px-6 mt-12 flex flex-col"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 255, 255, 0.01) 0%, transparent 100%)",
        }}
      >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          className="gradient-text"
          style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}
        >
          Portfolio
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "14px" }}>
          {address
            ? `${address.slice(0, 8)}...${address.slice(-6)}`
            : "Connect a wallet to view your positions, fees, and activity"}
        </p>
      </div>

      {/* Live on-chain pool state via the contract.ts read layer */}
      <ContractStatus />

      {/* Freighter wallet — detect · connect · balance · send XLM (Testnet) */}
      <StellarWalletPanel />

      {!address ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2
            style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}
          >
            Connect to view your positions
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.4)", marginBottom: "24px" }}>
            Your liquidity positions, fees, and activity will appear here.
          </p>
          <button
            className="btn-primary"
            onClick={connect}
            style={{ padding: "14px 32px", fontSize: "15px" }}
          >
            Connect Freighter
          </button>
        </div>
      ) : (
      <>
      {/* Summary cards */}
      {positions && positions.length > 0 && (
        <SummaryCards positions={positions} />
      )}

      {/* Positions */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700 }}>
            Positions
          </h2>
          <Link href="/liquidity/new" style={{ textDecoration: "none" }}>
            <button
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              + New Position
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: "200px",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "20px",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : positions && positions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {positions.map((p) => (
              <PositionCard
                key={p.id.toString()}
                position={p}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>📭</div>
            <p style={{ color: "#ffffff", fontWeight: 600, marginBottom: "6px" }}>
              No positions found
            </p>
            <p style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "14px", marginBottom: "20px" }}>
              Add liquidity to start earning fees
            </p>
            <Link href="/liquidity/new" style={{ textDecoration: "none" }}>
              <button
                className="btn-primary"
                style={{ padding: "12px 24px" }}
              >
                Add Liquidity
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 700,
            marginBottom: "16px",
          }}
        >
          Recent Activity
        </h2>
        <div
          className="glass-card"
          style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "20px" }}
        >
          <ActivityFeed walletAddress={address} />
        </div>
      </div>
      </>
      )}
      </div>
    </div>
  );
}
