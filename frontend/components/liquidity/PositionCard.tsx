"use client";

import { Position } from "@/hooks/usePositions";
import { formatAmount, fromStroops } from "@/lib/math";
import { usePool } from "@/hooks/usePool";
import { usePrices } from "@/hooks/usePrices";
import { useWallet } from "@/hooks/useWallet";
import { buildCollectTx, buildDecreaseLiquidityTx } from "@/lib/transactions";
import { submitTransaction } from "@/lib/stellar";
import { useToast } from "@/components/Toast";
import { useState } from "react";
import { useTxTracker } from "@/context/TxTrackerContext";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  position: Position;
  onRefresh: () => void;
}

export default function PositionCard({ position, onRefresh }: Props) {
  const { data: pool } = usePool();
  const { xlmUsd, usdcUsd } = usePrices();
  const { address, sign } = useWallet();
  const { addToast } = useToast();
  const { trackTx } = useTxTracker();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<"collect" | "remove" | null>(null);

  // Pool: token_0 = USDC, token_1 = XLM
  const usdcValue = formatAmount(position.amount0, 7, 4);
  const xlmValue  = formatAmount(position.amount1, 7, 4);
  const feeUsdc   = formatAmount(position.tokensOwed0, 7, 4);
  const feeXlm    = formatAmount(position.tokensOwed1, 7, 4);

  // Use real CoinGecko USD prices for valuation
  const usdTotal = xlmUsd > 0
    ? parseFloat(fromStroops(position.amount0)) * usdcUsd +
      parseFloat(fromStroops(position.amount1)) * xlmUsd
    : 0;

  const hasOwedTokens = position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;
  const isPositionClosed = position.liquidity === 0n;

  /** Refresh positions and wallet balances after any on-chain state change. */
  function refreshAll() {
    onRefresh();
    queryClient.invalidateQueries({ queryKey: ["balances"] });
    queryClient.invalidateQueries({ queryKey: ["pool"] });
  }

  /**
   * Collect owed tokens (fees + any burned amounts) from the position.
   * This calls PM.collect → pool.collect which transfers tokens to the user.
   */
  async function handleCollect() {
    if (!address || !sign) return;
    setLoading("collect");
    try {
      await trackTx(`Collect Fees for Position #${position.id.toString()}`, async (updateStep) => {
        updateStep("preparing");
        const xdr = await buildCollectTx(address, position.id, address);
        updateStep("waiting_signature");
        const signed = await sign(xdr);
        updateStep("submitting");
        updateStep("pending");
        const response = await submitTransaction(signed);
        return {
          hash: response.hash,
          ledger: response.ledger,
        };
      });
      addToast("Fees collected successfully!", "success");
      refreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Collect fees submission error:", err);
      addToast(`Failed to collect fees: ${msg}`, "error");
    } finally {
      setLoading(null);
    }
  }

  /**
   * Remove all liquidity from the position AND collect the owed tokens.
   *
   * Uniswap V3 (and our CLMM) uses a 2-step process:
   *   1. decrease_liquidity → burns liquidity, marks tokens as "owed"
   *   2. collect → actually transfers the owed tokens to the user
   *
   * We chain both into a single user flow so the user receives their funds
   * after one confirmation sequence.
   */
  async function handleRemove() {
    if (!address || !sign) return;
    setLoading("remove");
    try {
      // ── Step 1: Burn all liquidity ────────────────────────────────
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
      await trackTx(`Remove Liquidity – Position #${position.id.toString()}`, async (updateStep) => {
        updateStep("preparing");
        const xdr = await buildDecreaseLiquidityTx(
          address,
          position.id,
          position.liquidity,
          0n,
          0n,
          deadline
        );
        updateStep("waiting_signature");
        const signed = await sign(xdr);
        updateStep("submitting");
        updateStep("pending");
        const response = await submitTransaction(signed);
        return {
          hash: response.hash,
          ledger: response.ledger,
        };
      });

      // ── Step 2: Collect all owed tokens ───────────────────────────
      // After decrease_liquidity, the pool owes the user their deposited
      // tokens + any accrued fees. We must call collect() to transfer them.
      await trackTx(`Collect Tokens – Position #${position.id.toString()}`, async (updateStep) => {
        updateStep("preparing");
        const xdr = await buildCollectTx(address, position.id, address);
        updateStep("waiting_signature");
        const signed = await sign(xdr);
        updateStep("submitting");
        updateStep("pending");
        const response = await submitTransaction(signed);
        return {
          hash: response.hash,
          ledger: response.ledger,
        };
      });

      addToast("Position closed! Tokens returned to your wallet.", "success");
      refreshAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Remove liquidity error:", err);
      addToast(`Failed to remove liquidity: ${msg}`, "error");
      // Even if the collect step fails, the decrease step may have succeeded.
      // Refresh to show the updated position state so the user can retry collect.
      refreshAll();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        background: "oklch(1 0 0)",
        border: "1px solid oklch(0.12 0.01 60 / 0.15)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.12 0.01 60 / 0.3)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.12 0.01 60 / 0.15)")
      }
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "oklch(0.12 0.01 60 / 0.1)",
              borderRadius: "10px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <img src="/tokens/xlm.png" alt="XLM" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
            <span style={{ color: "oklch(0.45 0.02 60)", fontSize: "14px" }}>/</span>
            <img src="/tokens/usdc.png" alt="USDC" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ color: "oklch(0.12 0.01 60)", fontWeight: 700, fontSize: "15px" }}>
              XLM / USDC
            </p>
            <p style={{ color: "oklch(0.45 0.02 60)", fontSize: "12px" }}>
              Position #{position.id.toString()}
            </p>
          </div>
        </div>
        <span
          className={
            isPositionClosed
              ? "badge-out-range"
              : position.inRange
              ? "badge-in-range"
              : "badge-out-range"
          }
        >
          {isPositionClosed
            ? "Closed"
            : position.inRange
            ? "✓ In Range"
            : "⚠ Out of Range"}
        </span>
      </div>

      {/* Price range */}
      <div
        style={{
          background: "oklch(0.12 0.01 60 / 0.05)",
          border: "1px solid oklch(0.12 0.01 60 / 0.1)",
          borderRadius: "10px",
          padding: "12px 16px",
        }}
      >
        <p style={{ color: "oklch(0.45 0.02 60)", fontSize: "11px", marginBottom: "6px" }}>
          PRICE RANGE (USDC per XLM)
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ color: "oklch(0.45 0.02 60)", fontSize: "11px" }}>Min</p>
            <p style={{ color: "oklch(0.12 0.01 60)", fontWeight: 600 }}>
              ${(1 / position.priceUpper).toFixed(4)}
            </p>
          </div>
          <div style={{ color: "oklch(0.45 0.02 60)" }}>→</div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "oklch(0.45 0.02 60)", fontSize: "11px" }}>Max</p>
            <p style={{ color: "oklch(0.12 0.01 60)", fontWeight: 600 }}>
              ${(1 / position.priceLower).toFixed(4)}
            </p>
          </div>
        </div>
        {pool && (
          <div style={{ marginTop: "8px", textAlign: "center" }}>
            <span style={{ color: "oklch(0.12 0.01 60)", fontSize: "12px" }}>
              Current: ${(1 / pool.currentPrice).toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Token amounts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <TokenAmount symbol="USDC" logo="/tokens/usdc.png" amount={usdcValue} />
        <TokenAmount symbol="XLM"  logo="/tokens/xlm.png" amount={xlmValue} />
      </div>

      {/* USD value */}
      {usdTotal > 0 && (
        <p style={{ color: "oklch(0.45 0.02 60)", fontSize: "13px", textAlign: "center" }}>
          Total Value ≈{" "}
          <span style={{ color: "oklch(0.12 0.01 60)", fontWeight: 600 }}>
            ${usdTotal.toFixed(2)}
          </span>
        </p>
      )}

      {/* Owed tokens / Fees section */}
      {hasOwedTokens && (
        <div
          style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: "10px",
            padding: "12px 16px",
          }}
        >
          <p
            style={{ color: "#22c55e", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}
          >
            {isPositionClosed ? "Tokens to Collect" : "Uncollected Fees"}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "oklch(0.45 0.02 60)", fontSize: "13px" }}>
              {feeUsdc} USDC
            </span>
            <span style={{ color: "oklch(0.45 0.02 60)", fontSize: "13px" }}>
              {feeXlm} XLM
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Collect button — visible when there are owed tokens */}
        <button
          onClick={handleCollect}
          disabled={loading !== null || !hasOwedTokens}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid rgba(34,197,94,0.3)",
            background: "rgba(34,197,94,0.1)",
            color: "#22c55e",
            cursor: loading !== null || !hasOwedTokens ? "not-allowed" : "pointer",
            fontWeight: 600,
            fontSize: "14px",
            opacity: loading !== null || !hasOwedTokens ? 0.4 : 1,
          }}
        >
          {loading === "collect"
            ? "Collecting..."
            : isPositionClosed
            ? "Collect Tokens"
            : "Collect Fees"}
        </button>
        {/* Remove button — only when there is still liquidity */}
        {!isPositionClosed && (
          <button
            onClick={handleRemove}
            disabled={loading !== null}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.08)",
              color: "#f87171",
              cursor: loading !== null ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "14px",
              opacity: loading !== null ? 0.4 : 1,
            }}
          >
            {loading === "remove" ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}

function TokenAmount({
  symbol,
  logo,
  amount,
}: {
  symbol: string;
  logo: string;
  amount: string;
}) {
  return (
    <div
      style={{
        background: "oklch(0.12 0.01 60 / 0.05)",
        border: "1px solid oklch(0.12 0.01 60 / 0.1)",
        borderRadius: "10px",
        padding: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "4px",
        }}
      >
        <img src={logo} alt={symbol} style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />
        <span style={{ color: "oklch(0.45 0.02 60)", fontSize: "12px" }}>{symbol}</span>
      </div>
      <p style={{ color: "oklch(0.12 0.01 60)", fontWeight: 600, fontSize: "15px" }}>
        {amount}
      </p>
    </div>
  );
}
