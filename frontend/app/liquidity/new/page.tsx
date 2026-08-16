"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LiquidityChart from "@/components/liquidity/LiquidityChart";
import Navbar from "@/components/Navbar";
import AprDonut from "@/components/liquidity/AprDonut";
import { usePool } from "@/hooks/usePool";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/Toast";
import { useTxTracker } from "@/context/TxTrackerContext";
import { useSpotPrices, useMarket24h } from "@/hooks/useMarketData";
import { useBalances } from "@/hooks/useBalances";
import { usePoolReserves } from "@/hooks/usePoolStats";
import {
  toStroops,
  fromStroops,
  getLiquidityForAmounts,
  getAmountsForLiquidity,
  sqrtPriceX64ToPrice,
  tickToSqrtPriceX64,
  tickToPrice,
  roundTick,
  priceToTick,
  clampTick,
  applyPreset,
  formatUsd,
} from "@/lib/math";
import { buildMintTx, buildApprovalTx } from "@/lib/transactions";
import { submitTransaction, getLatestLedger, hasTrustline, buildTrustlineTx } from "@/lib/stellar";
import { useQueryClient } from "@tanstack/react-query";
import { POOL_ADDRESS } from "@/lib/stellar/contracts";
import { XLM_ADDRESS, USDC_ADDRESS, USDC_ISSUER, USDC_ASSET_CODE, STROOP } from "@/lib/stellar/assets";
import { TICK_SPACING } from "@/lib/math";
import { readTickSpacing, readToken0, readToken1 } from "@/lib/contract";
import { fetchBalances } from "@/hooks/useBalances";

const PRESETS = [
  { label: "±1%", pct: 0.01 },
  { label: "±5%", pct: 0.05 },
  { label: "±10%", pct: 0.1 },
  { label: "±20%", pct: 0.2 },
  { label: "±50%", pct: 0.5 },
] as const;

const XLM_GAS_RESERVE = 2n * STROOP;
const ADD_LIQUIDITY_SLIPPAGE_BPS = 50n;

export default function AddLiquidityPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: pool } = usePool();
  const { address, connect, sign } = useWallet();
  const { addToast } = useToast();
  const { trackTx } = useTxTracker();
  const { data: spot } = useSpotPrices();
  const { data: market } = useMarket24h();
  const { data: balances } = useBalances(address);
  const { data: reserves } = usePoolReserves();

  const xlmUsd = spot?.xlmUsd ?? 0;
  const usdcUsd = spot?.usdcUsd ?? 1;

  const liveUsdcPerXlm = xlmUsd > 0 ? xlmUsd / usdcUsd : 0;
  const onChainXlmPerUsdc = pool ? sqrtPriceX64ToPrice(pool.sqrtPriceX64) : 0;
  const poolUsdcPerXlm = onChainXlmPerUsdc > 0 ? 1 / onChainXlmPerUsdc : 0;

  const currentUsdcPerXlm = poolUsdcPerXlm > 0 ? poolUsdcPerXlm : liveUsdcPerXlm;
  const currentXlmPerUsdc = onChainXlmPerUsdc;
  const sqrtCurrent = pool?.sqrtPriceX64 ?? 0n;
  const currentTick = pool?.tick ?? 0;

  const [tickLower, setTickLower] = useState(0);
  const [tickUpper, setTickUpper] = useState(1);
  const [ticksReady, setTicksReady] = useState(false);
  const [amountXlm, setAmountXlm] = useState("");
  const [amountUsdc, setAmountUsdc] = useState("");
  const [activePreset, setActivePreset] = useState<number | null>(0.1);
  const [aprWindow, setAprWindow] = useState<"24H" | "7D" | "30D">("24H");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentXlmPerUsdc > 0 && !ticksReady) {
      const { tickLower: tl, tickUpper: tu } = applyPreset(currentXlmPerUsdc, 0.1, TICK_SPACING);
      /* eslint-disable react-hooks/set-state-in-effect */
      setTickLower(tl);
      setTickUpper(tu);
      setTicksReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [currentXlmPerUsdc, ticksReady]);

  const sqrtLower = tickToSqrtPriceX64(tickLower);
  const sqrtUpper = tickToSqrtPriceX64(tickUpper);

  const minUsdcPerXlm = 1 / tickToPrice(tickUpper);
  const maxUsdcPerXlm = 1 / tickToPrice(tickLower);

  const price0Only = currentTick < tickLower;
  const price1Only = currentTick >= tickUpper;

  function syncFromXlm(raw: string) {
    setAmountXlm(raw);
    if (!raw || isNaN(parseFloat(raw))) { setAmountUsdc(""); return; }
    if (price0Only) return;
    const a1 = toStroops(raw);
    if (a1 === 0n) { setAmountUsdc(""); return; }
    const L = getLiquidityForAmounts(sqrtCurrent, sqrtLower, sqrtUpper, 10n ** 18n, a1);
    const { amount0: usdc } = getAmountsForLiquidity(sqrtCurrent, sqrtLower, sqrtUpper, L);
    setAmountUsdc(fromStroops(usdc));
  }

  function syncFromUsdc(raw: string) {
    setAmountUsdc(raw);
    if (!raw || isNaN(parseFloat(raw))) { setAmountXlm(""); return; }
    if (price1Only) return;
    const a0 = toStroops(raw);
    if (a0 === 0n) { setAmountXlm(""); return; }
    const L = getLiquidityForAmounts(sqrtCurrent, sqrtLower, sqrtUpper, a0, 10n ** 18n);
    const { amount1: xlm } = getAmountsForLiquidity(sqrtCurrent, sqrtLower, sqrtUpper, L);
    setAmountXlm(fromStroops(xlm));
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (amountXlm && !price0Only) {
      const a1 = toStroops(amountXlm);
      if (a1 > 0n) {
        const L = getLiquidityForAmounts(sqrtCurrent, sqrtLower, sqrtUpper, 10n ** 18n, a1);
        const { amount0: usdc } = getAmountsForLiquidity(sqrtCurrent, sqrtLower, sqrtUpper, L);
        setAmountUsdc(fromStroops(usdc));
      }
    } else if (amountUsdc && !price1Only) {
      const a0 = toStroops(amountUsdc);
      if (a0 > 0n) {
        const L = getLiquidityForAmounts(sqrtCurrent, sqrtLower, sqrtUpper, a0, 10n ** 18n);
        const { amount1: xlm } = getAmountsForLiquidity(sqrtCurrent, sqrtLower, sqrtUpper, L);
        setAmountXlm(fromStroops(xlm));
      }
    }
  }, [tickLower, tickUpper, sqrtCurrent]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable react-hooks/set-state-in-effect */

  function applyPresetPct(pct: number) {
    const { tickLower: tl, tickUpper: tu } = applyPreset(currentXlmPerUsdc, pct, TICK_SPACING);
    setTickLower(tl);
    setTickUpper(tu);
    setActivePreset(pct);
  }

  function setMinPrice(usdcPerXlm: number) {
    if (usdcPerXlm <= 0) return;
    const t = clampTick(roundTick(priceToTick(1 / usdcPerXlm), TICK_SPACING));
    if (t > tickLower) { setTickUpper(t); setActivePreset(null); }
  }
  function setMaxPrice(usdcPerXlm: number) {
    if (usdcPerXlm <= 0) return;
    const t = clampTick(roundTick(priceToTick(1 / usdcPerXlm), TICK_SPACING));
    if (t < tickUpper) { setTickLower(t); setActivePreset(null); }
  }

  const a0Usdc = toStroops(amountUsdc);
  const a1Xlm = toStroops(amountXlm);
  const hasValidTickRange =
    ticksReady &&
    tickLower < tickUpper &&
    tickLower % TICK_SPACING === 0 &&
    tickUpper % TICK_SPACING === 0 &&
    sqrtCurrent > 0n &&
    sqrtLower < sqrtUpper;
  const liquidity = hasValidTickRange
    ? getLiquidityForAmounts(sqrtCurrent, sqrtLower, sqrtUpper, a0Usdc, a1Xlm)
    : 0n;
  const requiredAmounts = liquidity > 0n && hasValidTickRange
    ? getAmountsForLiquidity(sqrtCurrent, sqrtLower, sqrtUpper, liquidity)
    : { amount0: 0n, amount1: 0n };
  const amount0Min = applySlippageMin(requiredAmounts.amount0);
  const amount1Min = applySlippageMin(requiredAmounts.amount1);
  const validationMessage =
    !hasValidTickRange && ticksReady
      ? "Invalid price range"
      : requiredAmounts.amount0 > a0Usdc
        ? "Invalid liquidity amount"
        : requiredAmounts.amount1 > a1Xlm
          ? "Invalid liquidity amount"
          : balances && requiredAmounts.amount0 > balances.usdc
            ? "Insufficient USDC balance"
            : balances && requiredAmounts.amount1 + XLM_GAS_RESERVE > balances.xlm
              ? "Insufficient XLM balance"
              : null;
  const validationDetail =
    validationMessage === "Insufficient USDC balance" && balances
      ? `This range requires ${fromStroops(requiredAmounts.amount0)} USDC, but your wallet has ${fromStroops(balances.usdc)} USDC. Add USDC or choose an XLM-only range.`
      : validationMessage === "Insufficient XLM balance" && balances
        ? `This range requires ${fromStroops(requiredAmounts.amount1)} XLM plus a 2 XLM gas reserve, but your wallet has ${fromStroops(balances.xlm)} XLM.`
        : validationMessage === "Invalid liquidity amount"
          ? "The selected liquidity would require more tokens than the entered amounts."
          : validationMessage === "Invalid price range"
            ? "Choose a lower price below the upper price, aligned to the pool tick spacing."
            : null;

  const xlmValue = (parseFloat(amountXlm) || 0) * xlmUsd;
  const usdcValue = (parseFloat(amountUsdc) || 0) * usdcUsd;
  const totalValue = xlmValue + usdcValue;
  const ratioXlm = totalValue > 0 ? (xlmValue / totalValue) * 100 : 0;
  const ratioUsdc = 100 - ratioXlm;

  const estApr = useMemo(() => {
    if (minUsdcPerXlm <= 0 || maxUsdcPerXlm <= 0) return 0;
    const r = minUsdcPerXlm / maxUsdcPerXlm;
    const mult = r >= 1 ? 50 : Math.min(50, 1 / (1 - Math.pow(r, 0.25)));
    const base = 0.02;
    return Math.min(999, base * mult * 100);
  }, [minUsdcPerXlm, maxUsdcPerXlm]);

  const tvlUsd =
    reserves && xlmUsd > 0
      ? reserves.xlmReserve * xlmUsd + reserves.usdcReserve * usdcUsd
      : null;
  const livePrice = currentUsdcPerXlm;
  const change24h = market?.change24h ?? 0;

  function setXlmFraction(frac: number) {
    if (!balances) return;
    const usable = balances.xlm > XLM_GAS_RESERVE ? balances.xlm - XLM_GAS_RESERVE : 0n;
    const amt = frac === 1 ? usable : (balances.xlm * BigInt(Math.round(frac * 100))) / 100n;
    syncFromXlm(fromStroops(amt));
  }
  function setUsdcFraction(frac: number) {
    if (!balances) return;
    const amt = (balances.usdc * BigInt(Math.round(frac * 100))) / 100n;
    syncFromUsdc(fromStroops(amt));
  }

  async function handleAdd() {
    if (!address) { await connect(); return; }
    if (liquidity === 0n) {
      addToast(hasValidTickRange ? "Invalid liquidity amount" : "Invalid price range", "error");
      return;
    }
    setLoading(true);
    try {
      const [token0, token1, spacing, freshBalances] = await Promise.all([
        readToken0(POOL_ADDRESS),
        readToken1(POOL_ADDRESS),
        readTickSpacing(POOL_ADDRESS),
        queryClient.fetchQuery({
          queryKey: ["balances", address],
          queryFn: () => fetchBalances(address),
          staleTime: 0,
        }),
      ]);

      if (token0 !== USDC_ADDRESS || token1 !== XLM_ADDRESS) {
        console.error("Pool token ordering mismatch", {
          pool: POOL_ADDRESS,
          expectedToken0: USDC_ADDRESS,
          expectedToken1: XLM_ADDRESS,
          actualToken0: token0,
          actualToken1: token1,
        });
        throw new Error("Token authorization failed");
      }

      if (
        spacing <= 0 ||
        tickLower >= tickUpper ||
        tickLower % spacing !== 0 ||
        tickUpper % spacing !== 0
      ) {
        throw new Error("Invalid price range");
      }

      if (requiredAmounts.amount0 > a0Usdc || requiredAmounts.amount1 > a1Xlm) {
        console.error("Liquidity calculation exceeds entered amounts", {
          enteredUsdc: a0Usdc.toString(),
          enteredXlm: a1Xlm.toString(),
          requiredUsdc: requiredAmounts.amount0.toString(),
          requiredXlm: requiredAmounts.amount1.toString(),
          liquidity: liquidity.toString(),
          tickLower,
          tickUpper,
          sqrtCurrent: sqrtCurrent.toString(),
        });
        throw new Error("Invalid liquidity amount");
      }

      if (requiredAmounts.amount0 > freshBalances.usdc) {
        throw new Error("Insufficient USDC balance");
      }

      if (requiredAmounts.amount1 + XLM_GAS_RESERVE > freshBalances.xlm) {
        throw new Error("Insufficient XLM balance");
      }

      const deadline = getMintDeadline();
      const currentLedger = await getLatestLedger();
      const approvalExpiry = currentLedger + 500;
      let mintResult: { hash: string; ledger?: number } | null = null;

      await trackTx("Add Liquidity", async (updateStep) => {
        if (requiredAmounts.amount0 > 0n && !(await hasTrustline(address, USDC_ASSET_CODE, USDC_ISSUER))) {
          updateStep("preparing");
          const trustXdr = await buildTrustlineTx(address, USDC_ASSET_CODE, USDC_ISSUER);
          updateStep("waiting_signature");
          const signedTrust = await sign(trustXdr);
          updateStep("submitting");
          updateStep("pending");
          await submitTransaction(signedTrust);
        }

        if (requiredAmounts.amount1 > 0n) {
          updateStep("preparing");
          const xdr = await buildApprovalTx(address, XLM_ADDRESS, POOL_ADDRESS, requiredAmounts.amount1, approvalExpiry);
          updateStep("waiting_signature");
          const signed = await sign(xdr);
          updateStep("submitting");
          updateStep("pending");
          await submitTransaction(signed);
        }

        if (requiredAmounts.amount0 > 0n) {
          updateStep("preparing");
          const xdr = await buildApprovalTx(address, USDC_ADDRESS, POOL_ADDRESS, requiredAmounts.amount0, approvalExpiry);
          updateStep("waiting_signature");
          const signed = await sign(xdr);
          updateStep("submitting");
          updateStep("pending");
          await submitTransaction(signed);
        }

        updateStep("preparing");
        const mintXdr = await buildMintTx(
          address, POOL_ADDRESS, tickLower, tickUpper, liquidity,
          amount0Min, amount1Min, deadline
        );
        updateStep("waiting_signature");
        const signedMint = await sign(mintXdr);
        updateStep("submitting");
        updateStep("pending");
        const response = await submitTransaction(signedMint);
        mintResult = {
          hash: response.hash,
          ledger: response.ledger,
        };

        return mintResult;
      });

      if (!mintResult) return;

      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      router.push("/liquidity");
    } catch (err: unknown) {
      console.error("Add liquidity submission error:", err);
      addToast(getAddLiquidityErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }

  const canAdd = address && liquidity > 0n && !loading && ticksReady && !validationMessage;
  const fmtP = (p: number) => (p >= 1 ? p.toFixed(4) : p.toFixed(6));

  return (
    <div className="w-full min-h-screen flex flex-col text-white bg-[#06060c]">
      <Navbar />
      <div className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-28 pb-12">
        <button
          onClick={() => router.push("/liquidity")}
          className="bg-transparent border-none text-white/50 hover:text-white cursor-pointer text-sm mb-4 transition-colors"
        >
          ← Back to Positions
        </button>

        {/* Header bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap gap-4 items-center justify-between mb-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <img src="/xlm.svg" alt="XLM" className="w-6 h-6 rounded-full object-contain" />
              </span>
              <span className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center -ml-3">
                <img src="/usdc.svg" alt="USDC" className="w-6 h-6 rounded-full object-contain" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-white">XLM / USDC</span>
                <span className="text-xs font-bold rounded-full px-2.5 py-0.5 bg-white/15 text-white">0.3%</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="live-dot" />
                <span className="text-xs sm:text-sm text-white/60">
                  ${fmtP(livePrice)}{" "}
                  <span className={change24h >= 0 ? "text-green-400" : "text-red-400"}>
                    {change24h >= 0 ? "▲" : "▼"} {Math.abs(change24h * 100).toFixed(2)}%
                  </span>{" "}
                  · Live Coinbase
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-8 flex-wrap">
            <Stat label="Liquidity (TVL)" value={tvlUsd !== null ? formatUsd(tvlUsd) : "—"} />
            <Stat label="Pool Reserves" value={reserves ? `${compact(reserves.xlmReserve)} XLM` : "—"} sub={reserves ? `${compact(reserves.usdcReserve)} USDC` : undefined} />
            <Stat label="Current Price" value={currentUsdcPerXlm > 0 ? `$${fmtP(currentUsdcPerXlm)}` : "—"} sub="USDC per XLM" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Set Price Range */}
          <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white">Set Price Range</h2>
              <span className="text-xs text-white/50">USDC per XLM</span>
            </div>

            {!ticksReady ? (
              <div className="h-72 flex items-center justify-center gap-2 text-white/50 text-sm">
                <div className="spinner w-4 h-4" />
                Loading live price…
              </div>
            ) : (
              <LiquidityChart
                currentPrice={currentUsdcPerXlm}
                priceLower={minUsdcPerXlm}
                priceUpper={maxUsdcPerXlm}
                low24h={market?.low24h ?? null}
                high24h={market?.high24h ?? null}
                onPriceLowerChange={setMinPrice}
                onPriceUpperChange={setMaxPrice}
                disabled={!ticksReady}
              />
            )}

            {/* Min / Max inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <PriceField label="Min Price" sub="USDC per XLM" value={minUsdcPerXlm} onCommit={setMinPrice} />
              <PriceField label="Max Price" sub="USDC per XLM" value={maxUsdcPerXlm} onCommit={setMaxPrice} />
            </div>

            {/* Presets */}
            <div className="flex gap-2 flex-wrap mt-4 items-center">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPresetPct(p.pct)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    activePreset === p.pct
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <span className="text-xs text-white/40 ml-auto">
                Ticks {tickLower} → {tickUpper}
              </span>
            </div>

            {/* Estimated APR */}
            <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white">Estimated APR</span>
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  {(["24H", "7D", "30D"] as const).map((w) => (
                    <button key={w} onClick={() => setAprWindow(w)} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      aprWindow === w ? "bg-white/20 text-white" : "text-white/50"
                    }`}>{w}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-extrabold text-white">{estApr.toFixed(2)}%</span>
                <AprDonut aprPct={estApr} />
                <div className="text-xs text-white/50 leading-relaxed">
                  <div><span className="text-white">●</span> Trade fees (0.3% tier)</div>
                  <div className="mt-0.5">Narrower range earns higher yield</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Deposit Amounts */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Add Deposit Amount</h2>

            {(price0Only || price1Only) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400 leading-relaxed">
                {price0Only
                  ? <><strong>Price is below your range.</strong> Deposit will be 100% USDC.</>
                  : <><strong>Price is above your range.</strong> Deposit will be 100% XLM.</>}
              </div>
            )}

            <TokenBox
              symbol="XLM" icon="/xlm.svg"
              value={amountXlm}
              usd={xlmValue}
              balance={balances ? parseFloat(fromStroops(balances.xlm)) : null}
              disabled={price0Only}
              onChange={syncFromXlm}
              onMax={() => setXlmFraction(1)}
              onHalf={() => setXlmFraction(0.5)}
            />

            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-base font-bold">+</div>
            </div>

            <TokenBox
              symbol="USDC" icon="/usdc.svg"
              value={amountUsdc}
              usd={usdcValue}
              balance={balances ? parseFloat(fromStroops(balances.usdc)) : null}
              disabled={price1Only}
              onChange={syncFromUsdc}
              onMax={() => setUsdcFraction(1)}
              onHalf={() => setUsdcFraction(0.5)}
            />

            {/* Totals */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-xs">Total Deposit</span>
                <span className="text-white text-base font-bold">{totalValue > 0 ? formatUsd(totalValue) : "$0.00"}</span>
              </div>
              {liquidity > 0n && (
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span>Required</span>
                  <span>
                    {fromStroops(requiredAmounts.amount1)} XLM / {fromStroops(requiredAmounts.amount0)} USDC
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-white/50">
                <span>Deposit Ratio</span>
                <span className="inline-flex items-center gap-1">
                  {ratioXlm.toFixed(1)}% <img src="/xlm.svg" alt="XLM" className="w-3 h-3 rounded-full" /> / {ratioUsdc.toFixed(1)}% <img src="/usdc.svg" alt="USDC" className="w-3 h-3 rounded-full" />
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                <div style={{ width: `${ratioXlm}%` }} className="bg-cyan-400" />
                <div style={{ width: `${ratioUsdc}%` }} className="bg-purple-500" />
              </div>
            </div>

            {validationMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 leading-relaxed">
                <div className="font-semibold">{validationMessage}</div>
                {validationDetail && <div className="mt-1 text-red-200/80">{validationDetail}</div>}
              </div>
            )}

            <button className="btn-primary w-full py-4 text-base font-bold rounded-xl transition-all shadow-lg" onClick={handleAdd} disabled={!canAdd}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-4 h-4" /> Processing…
                </span>
              ) : !address ? "Connect Wallet" : validationMessage ?? (liquidity === 0n ? "Enter Amounts" : "Add Liquidity")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] text-white/40 mb-0.5">{label}</div>
      <div className="text-base font-bold text-white">{value}</div>
      {sub && <div className="text-[11px] text-white/40">{sub}</div>}
    </div>
  );
}

function PriceField({ label, sub, value, onCommit }: { label: string; sub: string; value: number; onCommit: (v: number) => void }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3">
      <div className="text-[11px] text-white/40 mb-1">{label}</div>
      <input
        type="number" step="any"
        key={value.toFixed(8)}
        defaultValue={value >= 1 ? value.toFixed(4) : value.toFixed(6)}
        onBlur={(e) => { const p = parseFloat(e.target.value); if (p > 0) onCommit(p); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className="w-full bg-transparent border-none outline-none text-white text-base font-bold font-jetbrains"
      />
      <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>
    </div>
  );
}

function TokenBox({ symbol, icon, value, usd, balance, disabled, onChange, onMax, onHalf }: {
  symbol: string; icon: string; value: string; usd: number; balance: number | null;
  disabled: boolean; onChange: (v: string) => void; onMax: () => void; onHalf: () => void;
}) {
  return (
    <div className={`p-4 rounded-xl bg-white/[0.03] border border-white/10 ${disabled ? "opacity-45" : ""}`}>
      <div className="flex justify-between items-center mb-2.5">
        <span className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5">
          <img src={icon} alt={symbol} className="w-5 h-5 rounded-full object-contain" />
          <span className="text-white font-bold text-sm">{symbol}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-white/40 mr-1">Bal {balance !== null ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</span>
          <button onClick={onHalf} disabled={disabled} className="px-2 py-0.5 rounded border border-white/10 bg-transparent text-white text-xs font-semibold cursor-pointer">50%</button>
          <button onClick={onMax} disabled={disabled} className="px-2 py-0.5 rounded border border-white/10 bg-transparent text-white text-xs font-semibold cursor-pointer">Max</button>
        </div>
      </div>
      <input
        type="text" inputMode="decimal" placeholder="0.0"
        value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-none outline-none text-white text-2xl font-semibold text-right font-jetbrains"
      />
      {usd > 0 && <div className="text-[11px] text-white/40 text-right mt-1">≈ {formatUsd(usd)}</div>}
    </div>
  );
}

function applySlippageMin(amount: bigint): bigint {
  if (amount === 0n) return 0n;
  return (amount * (10_000n - ADD_LIQUIDITY_SLIPPAGE_BPS)) / 10_000n;
}

function getMintDeadline(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 300);
}

function getAddLiquidityErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  let details = "";
  try {
    details = JSON.stringify(err, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  } catch {
    details = "";
  }
  const raw = `${message} ${details}`.toLowerCase();

  if (raw.includes("insufficient usdc")) return "Insufficient USDC balance";
  if (raw.includes("insufficient xlm")) return "Insufficient XLM balance";
  if (
    raw.includes("resulting balance is not within the allowed range") ||
    raw.includes("tx_insufficient_balance") ||
    raw.includes("underfunded")
  ) {
    return "Insufficient XLM balance";
  }
  if (raw.includes("authorization") || raw.includes("allowance") || raw.includes("auth")) {
    return "Token authorization failed";
  }
  if (raw.includes("invalid liquidity") || raw.includes("zero liquidity")) {
    return "Invalid liquidity amount";
  }
  if (raw.includes("price range") || raw.includes("tick")) {
    return "Invalid price range";
  }
  if (raw.includes("simulation")) {
    return "Transaction simulation failed";
  }
  return "Transaction simulation failed";
}

function compact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(2);
}
