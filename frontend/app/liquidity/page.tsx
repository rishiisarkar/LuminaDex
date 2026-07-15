"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { usePositions } from "@/hooks/usePositions";
import { usePool } from "@/hooks/usePool";
import PositionCard from "@/components/liquidity/PositionCard";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";

export default function LiquidityPage() {
  const { address, connect } = useWallet();
  const { data: positions, isLoading, refetch } = usePositions(address);
  const { data: pool } = usePool();
  const queryClient = useQueryClient();

  function handleRefresh() {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["positions"] });
    queryClient.invalidateQueries({ queryKey: ["balances"] });
    queryClient.invalidateQueries({ queryKey: ["pool"] });
  }

  return (
    <div className="w-full min-h-screen flex flex-col text-white">
      <Navbar />
      <div
        style={{
          flex: 1,
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          padding: "40px 24px",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 100%)",
        }}
      >
      {/* Header */}
      <div className="page-header-row" style={{ marginBottom: "32px" }}>
        <div>
          <h1
            className="gradient-text"
            style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}
          >
            Liquidity
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Provide liquidity to earn 0.3% trading fees
          </p>
        </div>
        <Link
          href="/liquidity/new"
          style={{ textDecoration: "none" }}
        >
          <button
            className="btn-primary"
            style={{ padding: "12px 24px", fontSize: "14px" }}
          >
            + Add Liquidity
          </button>
        </Link>
      </div>

      {/* Pool stats */}
      {pool && (
        <div
          className="liquidity-stats-grid"
          style={{
            marginBottom: "32px",
          }}
        >
          {[
            { label: "Current Price", value: `$${(1 / pool.currentPrice).toFixed(4)}`, sub: "USDC per XLM" },
            { label: "Current Tick", value: pool.tick.toString(), sub: "Pool tick index" },
            { label: "Active Liquidity", value: pool.liquidity > 0n ? "Active" : "No liquidity", sub: "0.3% fee tier" },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "6px" }}>
                {label}
              </p>
              <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "18px" }}>
                {value}
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "4px" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Positions */}
      {!address ? (
        <EmptyState
          title="Connect your wallet"
          desc="Connect Freighter wallet to view and manage your liquidity positions"
          action={<button className="btn-primary" onClick={connect} style={{ padding: "12px 24px" }}>Connect Wallet</button>}
        />
      ) : isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "220px",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : positions && positions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {positions.map((p) => (
            <PositionCard key={p.id.toString()} position={p} onRefresh={handleRefresh} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No positions yet"
          desc="Add liquidity to the XLM/USDC pool to start earning fees"
          action={
            <Link href="/liquidity/new" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ padding: "12px 24px" }}>
                Add Liquidity
              </button>
            </Link>
          }
        />
      )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
      }}
    >
      <h2 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "8px" }}>
        {title}
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>{desc}</p>
      {action}
    </div>
  );
}
