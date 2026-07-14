"use client";

import React, { useState } from "react";
import { Position } from "@/hooks/usePositions";
import { fromStroops } from "@/lib/math";
import { RefreshCw, Coins, TrendingUp } from "lucide-react";

interface PositionCardProps {
  position: Position;
  onRefresh: () => void;
}

export default function PositionCard({ position, onRefresh }: PositionCardProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const formattedAmount0 = parseFloat(fromStroops(position.amount0)).toLocaleString(undefined, { maximumFractionDigits: 4 });
  const formattedAmount1 = parseFloat(fromStroops(position.amount1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
  const formattedFees0 = parseFloat(fromStroops(position.tokensOwed0)).toLocaleString(undefined, { maximumFractionDigits: 5 });
  const formattedFees1 = parseFloat(fromStroops(position.tokensOwed1)).toLocaleString(undefined, { maximumFractionDigits: 5 });

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-white/15 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-base">USDC / XLM</span>
            <span className="text-white/40 text-xs font-mono">#{String(position.id)}</span>
          </div>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              position.inRange
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
          >
            {position.inRange ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Refresh Position Details"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bounds & Price Range */}
        <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Price Range
          </span>
          <div className="flex flex-col mt-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] text-white/30">Min:</span>
              <span className="text-sm font-bold text-white font-mono">{position.priceLower.toFixed(5)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-white/5 mt-1.5 pt-1.5">
              <span className="text-[11px] text-white/30">Max:</span>
              <span className="text-sm font-bold text-white font-mono">{position.priceUpper.toFixed(5)}</span>
            </div>
          </div>
        </div>

        {/* Selected Amounts inside pool */}
        <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wide flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            Liquidity Deposits
          </span>
          <div className="flex flex-col mt-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] text-white/30">USDC:</span>
              <span className="text-sm font-bold text-white font-mono">{formattedAmount0}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-white/5 mt-1.5 pt-1.5">
              <span className="text-[11px] text-white/30">XLM:</span>
              <span className="text-sm font-bold text-white font-mono">{formattedAmount1}</span>
            </div>
          </div>
        </div>

        {/* Uncollected fees earned */}
        <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/5 border border-white/5">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wide flex items-center gap-1">
            🎁
            Uncollected Fees
          </span>
          <div className="flex flex-col mt-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] text-white/30">USDC:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formattedFees0}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-white/5 mt-1.5 pt-1.5">
              <span className="text-[11px] text-white/30">XLM:</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{formattedFees1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
