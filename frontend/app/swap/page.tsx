"use client";

import { useState } from "react";
import { Repeat, SlidersHorizontal } from "lucide-react";
import TokenInputBox from "@/components/swap/TokenInputBox";
import PriceInfo from "@/components/swap/PriceInfo";
import SlippageSettings from "@/components/swap/SlippageSettings";
import { useWallet } from "@/hooks/useWallet";
import Navbar from "@/components/Navbar";
import { usePool } from "@/hooks/usePool";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { usePrices } from "@/hooks/usePrices";
import { toStroops, fromStroops, computePriceImpact, toUsd, formatUsd, sqrtPriceX64ToPrice } from "@/lib/math";
import { buildSwapTx, buildApprovalTx } from "@/lib/transactions";
import { submitTransaction, getLatestLedger } from "@/lib/stellar";
import { POOL_ADDRESS } from "@/lib/stellar/contracts";
import { XLM_ADDRESS, USDC_ADDRESS, FEE_TIER } from "@/lib/stellar/assets";
import { useToast } from "@/components/Toast";
import { useTxTracker } from "@/context/TxTrackerContext";

const XLM = { symbol: "XLM", name: "Stellar Lumens", logo: "/tokens/xlm.png" };
const USDC = { symbol: "USDC", name: "USD Coin", logo: "/tokens/usdc.png" };

export default function SwapPage() {
  const { address, connect, sign } = useWallet();
  const { data: pool } = usePool();
  const prices = usePrices();
  const { addToast } = useToast();
  const { trackTx } = useTxTracker();

  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [zeroForOne, setZeroForOne] = useState(true); // XLM → USDC
  const [loading, setLoading] = useState(false);
  const [highImpactAcknowledged, setHighImpactAcknowledged] = useState(false);

  const tokenIn = zeroForOne ? XLM : USDC;
  const tokenOut = zeroForOne ? USDC : XLM;

  const amountInStroops = toStroops(amountIn);
  const currentPrice = pool?.currentPrice ?? 0;

  const { data: quote, isFetching: quoteFetching, refetch: refetchQuote } = useSwapQuote(
    amountInStroops,
    zeroForOne,
    currentPrice,
    amountInStroops > 0n
  );

  const amountOut = quote ? fromStroops(quote.amountOut) : "";
  const slippageBps = BigInt(Math.round(slippage * 100));
  const amountOutMin = quote
    ? (quote.amountOut * (10000n - slippageBps)) / 10000n
    : 0n;

  // Rate and price-impact baseline must come from the same on-chain price the
  // quote (computeSwapQuote) trades against — not pool.currentPrice, which is
  // the live CoinGecko/Binance price and can drift from the pool's actual
  // price on a testnet pool with no arbitrage keeping it in line. Using two
  // different prices here made one swap direction look like a gain and the
  // other a loss for the same trade.
  const poolXlmPerUsdc = pool ? sqrtPriceX64ToPrice(pool.sqrtPriceX64) : 0;
  const usdcPerXlm = poolXlmPerUsdc > 0 ? 1 / poolXlmPerUsdc : 0;
  const xlmPerUsdc = poolXlmPerUsdc;
  const rate = pool
    ? zeroForOne
      ? `1 XLM ≈ ${usdcPerXlm.toFixed(4)} USDC`    // XLM→USDC: output is USDC
      : `1 USDC ≈ ${xlmPerUsdc.toFixed(4)} XLM`     // USDC→XLM: output is XLM
    : "—";

  const feeAmount = amountInStroops > 0n
    ? fromStroops((amountInStroops * 3n) / 1000n)
    : "0";

  // spotPriceOutPerIn: expected output per unit of input at current pool price
  const spotPriceOutPerIn = pool
    ? zeroForOne ? usdcPerXlm : xlmPerUsdc
    : 0;
  const amountInNum = parseFloat(amountIn) || 0;
  const amountOutNum = parseFloat(amountOut) || 0;
  const amountInUsd = toUsd(amountInNum, zeroForOne ? "xlm" : "usdc", prices);
  const priceImpactResult = computePriceImpact(
    amountInNum,
    amountOutNum,
    spotPriceOutPerIn,
    null,
    amountInUsd
  );

  async function handleSwap() {
    if (!address) {
      await connect();
      return;
    }
    if (!quote || amountInStroops === 0n) return;

    setLoading(true);
    try {
      // Gap 4: re-fetch quote immediately before building tx to catch any price movement
      const freshResult = await refetchQuote();
      const freshQuote = freshResult.data;
      if (freshQuote && quote.amountOut > 0n) {
        const outputDiff = freshQuote.amountOut > quote.amountOut
          ? freshQuote.amountOut - quote.amountOut
          : quote.amountOut - freshQuote.amountOut;
        const outputDiffPct = Number(outputDiff) / Number(quote.amountOut);
        if (outputDiffPct > slippage / 100) {
          addToast(
            `Price moved ${(outputDiffPct * 100).toFixed(2)}% since your quote. Please review the new rate.`,
            "error"
          );
          setLoading(false);
          return;
        }
      }

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
      const tokenInAddress = zeroForOne ? XLM_ADDRESS : USDC_ADDRESS;
      const tokenOutAddress = zeroForOne ? USDC_ADDRESS : XLM_ADDRESS;

      await trackTx(`Swap ${amountIn} ${tokenIn.symbol} → ${tokenOut.symbol}`, async (updateStep) => {
        // Step 1: Pre-Approve Spender
        updateStep("preparing");
        const currentLedger = await getLatestLedger();
        const approvalXdr = await buildApprovalTx(
          address,
          tokenInAddress,
          POOL_ADDRESS,
          amountInStroops * 2n,
          currentLedger + 500
        );

        updateStep("waiting_signature");
        const signedApproval = await sign(approvalXdr);

        updateStep("submitting");
        updateStep("pending");
        await submitTransaction(signedApproval);

        // Step 2: Swap Execution
        updateStep("preparing");
        const swapXdr = await buildSwapTx(
          address,
          tokenInAddress,
          tokenOutAddress,
          FEE_TIER,
          amountInStroops,
          amountOutMin,
          deadline,
          0n
        );

        updateStep("waiting_signature");
        const signedSwap = await sign(swapXdr);

        updateStep("submitting");
        updateStep("pending");
        const response = await submitTransaction(signedSwap);

        return {
          hash: response.hash,
          ledger: response.ledger,
        };
      });

      setAmountIn("");
    } catch (err: unknown) {
      console.error("Swap submission error:", err);
    } finally {
      setLoading(false);
    }
  }

  const canSwap =
    address &&
    amountInStroops > 0n &&
    quote &&
    quote.amountOut > 0n &&
    !loading &&
    (priceImpactResult.severity !== "very_high" || highImpactAcknowledged);

  return (
    <div className="w-full min-h-screen flex flex-col text-white">
      <Navbar />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "460px", position: "relative" }}>
        {/* Floating settings button */}
        <div className="swap-settings-btn">
          <SlippageSettings
            slippage={slippage}
            onChange={setSlippage}
            trigger={
              <button
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Slippage settings"
              >
                <SlidersHorizontal size={20} style={{ color: "var(--text-primary)", transform: "rotate(90deg)" }} />
              </button>
            }
          />
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "36px",
            padding: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Sell */}
            <TokenInputBox
              token={tokenIn}
              value={amountIn}
              onChange={setAmountIn}
              label="Sell"
              usdValue={
                amountInUsd > 0 && !prices.isError ? formatUsd(amountInUsd).replace("$", "") : undefined
              }
            />

            {/* Flip button — sits on the seam between the two panels */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1,
              }}
            >
              <button
                onClick={() => {
                  setZeroForOne((z) => !z);
                  setAmountIn("");
                }}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Flip tokens"
              >
                <Repeat size={20} />
              </button>
            </div>

            {/* Buy */}
            <TokenInputBox
              token={tokenOut}
              value={amountOut}
              readOnly
              label="Buy"
              loading={quoteFetching && amountInStroops > 0n}
              usdValue={(() => {
                const outUsd = toUsd(amountOutNum, zeroForOne ? "usdc" : "xlm", prices);
                return outUsd > 0 && !prices.isError ? formatUsd(outUsd).replace("$", "") : undefined;
              })()}
            />
          </div>

          {/* Price info */}
          {quote && amountOut && (
            <div style={{ margin: "16px 4px 0" }}>
              <PriceInfo
                rate={rate}
                priceImpact={priceImpactResult.impact}
                minimumReceived={`${fromStroops(amountOutMin)} ${tokenOut.symbol}`}
                fee={`${feeAmount} ${tokenIn.symbol}`}
                slippage={slippage}
                isThinPool={priceImpactResult.isThinPool}
                lastFetchedAt={pool?.lastFetchedAt}
                onHighImpactAcknowledged={setHighImpactAcknowledged}
              />
            </div>
          )}

          {/* Swap button */}
          <button
            className="btn-primary"
            onClick={handleSwap}
            disabled={!canSwap && Boolean(address)}
            style={{
              width: "100%",
              padding: "20px",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: "24px",
              marginTop: "12px",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div className="spinner" style={{ width: "18px", height: "18px" }} />
                Swapping...
              </span>
            ) : !address ? (
              "Connect Wallet"
            ) : amountInStroops === 0n ? (
              "Enter Amount"
            ) : quoteFetching ? (
              "Fetching Quote..."
            ) : !quote || quote.amountOut === 0n ? (
              "Insufficient Liquidity"
            ) : (
              `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`
            )}
          </button>
        </div>

        {/* Pool info footer */}
        {pool && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {[
              { label: "Liquidity", value: `${fromStroops(pool.liquidity)} L` },
              { label: "Tick", value: `${pool.tick}` },
              { label: "Fee", value: "0.3%" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{label}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
