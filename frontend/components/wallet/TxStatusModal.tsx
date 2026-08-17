"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTxTracker, TxStep } from "@/context/TxTrackerContext";
import { usePathname } from "next/navigation";
import { 
  X, 
  Loader2, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  FileText,
  RefreshCw
} from "lucide-react";
import StarRating from "@/components/assistant/StarRating";
import { submitFeedback } from "@/lib/feedback/submitFeedback";
import { useWallet } from "@/hooks/useWallet";

interface StepConfig {
  id: TxStep;
  label: string;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    id: "preparing",
    label: "Preparing Transaction",
    description: "Building your Stellar transaction.",
  },
  {
    id: "waiting_signature",
    label: "Waiting for Wallet",
    description: "Confirm the transaction in your connected wallet.",
  },
  {
    id: "submitting",
    label: "Submitting",
    description: "Sending your transaction to the Stellar network.",
  },
  {
    id: "pending",
    label: "Confirming",
    description: "Waiting for on-chain confirmation.",
  },
];

export default function TxStatusModal() {
  const { state, isModalOpen, closeModal, retryTx } = useTxTracker();
  const { step, txHash, ledger, error, title } = state;
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showExperiencePrompt, setShowExperiencePrompt] = useState(false);
  const [promptRating, setPromptRating] = useState(0);
  const [promptSubmitted, setPromptSubmitted] = useState(false);
  const pathname = usePathname();
  const { address } = useWallet();

  const isCompleted = step === "confirmed";
  const isFailed = step === "failed";
  const isPending = !isCompleted && !isFailed;

  // Determine active step index
  let activeIndex = 0;
  if (step === "waiting_signature") activeIndex = 1;
  if (step === "submitting") activeIndex = 2;
  if (step === "pending") activeIndex = 3;
  if (isCompleted) activeIndex = 4;
  if (isFailed) activeIndex = activeIndex; // hold index on fail

  const promptKind = getPromptKind(title);

  useEffect(() => {
    const id = window.setTimeout(() => {
    if (!isCompleted || !promptKind || typeof window === "undefined") {
      setShowExperiencePrompt(false);
      return;
    }
    const key = getPromptStorageKey(promptKind);
    const lastPrompt = Number(window.localStorage.getItem(key) ?? "0");
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    setShowExperiencePrompt(Date.now() - lastPrompt > sevenDays);
    setPromptRating(0);
    setPromptSubmitted(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [isCompleted, promptKind]);

  async function submitPromptRating(rating: number) {
    setPromptRating(rating);
    if (!promptKind || promptSubmitted) return;
    setPromptSubmitted(true);
    const queued = await submitFeedback(
      {
        type: "rating",
        rating,
        category: promptKind === "swap" ? "Swap" : "Liquidity",
        message: `Post-transaction rating for ${title}`,
      },
      {
        route: pathname,
        walletAddress: address ?? undefined,
        walletConnected: Boolean(address),
        network: "Stellar Testnet",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        screenSize:
          typeof window !== "undefined"
            ? `${window.innerWidth}x${window.innerHeight}`
            : undefined,
      }
    );
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getPromptStorageKey(promptKind), String(Date.now()));
    }
    if (queued) {
      setPromptSubmitted(true);
    }
  }

  function dismissPrompt() {
    setShowExperiencePrompt(false);
    if (promptKind && typeof window !== "undefined") {
      window.localStorage.setItem(getPromptStorageKey(promptKind), String(Date.now()));
    }
  }

  if (!isModalOpen || step === "idle") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[440px] rounded-[30px] border border-white/10 bg-[#0d0b14]/95 p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Background Glows */}
          {isCompleted && (
            <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          )}
          {isFailed && (
            <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          )}
          {isPending && (
            <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-[#3D81E3]/10 blur-3xl pointer-events-none" />
          )}

          {/* Close Button */}
          {(isCompleted || isFailed) && (
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Title / Action */}
          <div className="mb-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/30">Transaction status</span>
            <h4 className="text-lg font-bold text-white mt-0.5 leading-tight">{title || "Transaction"}</h4>
          </div>

          {/* Stepper (Only show if not failed, or show alongside error) */}
          <div className="flex flex-col gap-4">
            {STEPS.map((s, idx) => {
              const isStepDone = idx < activeIndex || isCompleted;
              const isStepActive = idx === activeIndex && isPending;

              let icon = (
                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-semibold font-mono">
                  {idx + 1}
                </div>
              );

              if (isStepDone) {
                icon = (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                );
              } else if (isStepActive) {
                icon = (
                  <div className="w-5 h-5 rounded-full border border-[#3D81E3] flex items-center justify-center">
                    <Loader2 className="w-3 h-3 animate-spin text-[#3D81E3]" />
                  </div>
                );
              }

              return (
                <div key={s.id} className="flex gap-4 items-start relative">
                  {/* Vertical connecting line */}
                  {idx < 3 && (
                    <div
                      className={`absolute left-[9px] top-6 w-[2px] h-[calc(100%-8px)] transition-colors duration-300 ${
                        idx < activeIndex || isCompleted
                          ? "bg-emerald-500"
                          : idx === activeIndex && isPending
                          ? "bg-gradient-to-b from-[#3D81E3] to-white/10"
                          : "bg-white/10"
                      }`}
                    />
                  )}

                  <div className="flex-shrink-0 mt-0.5">{icon}</div>
                  <div>
                    <span
                      className={`text-sm font-semibold block transition-colors ${
                        isStepDone
                          ? "text-white/80"
                          : isStepActive
                          ? "text-[#3D81E3]"
                          : "text-white/30"
                      }`}
                    >
                      {s.label}
                    </span>
                    {isStepActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-white/50 mt-1 leading-relaxed"
                      >
                        {s.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Success State Details */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3.5"
            >
              <div className="flex gap-2 items-center text-emerald-400 font-semibold text-sm">
                <Check className="w-4 h-4" />
                Transaction Confirmed
              </div>

              {ledger && (
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-white/40">Ledger</span>
                  <span className="text-white/70 font-mono font-medium">#{ledger}</span>
                </div>
              )}

              {txHash && (
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-white/40">Transaction Hash</span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="font-mono text-white/70 truncate select-all">{txHash}</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3D81E3] hover:text-[#00d2ff] transition-colors p-1 flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {showExperiencePrompt && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">How was your experience?</p>
                      <p className="mt-0.5 text-xs text-white/45">
                        A quick rating helps us improve this flow.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={dismissPrompt}
                      className="text-xs font-semibold text-white/35 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="mt-3">
                    <StarRating value={promptRating} onChange={submitPromptRating} compact />
                  </div>
                  {promptSubmitted && (
                    <p className="mt-2 text-xs font-semibold text-emerald-300">
                      Thanks for the rating.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("lumina:open-assistant", {
                          detail: { mode: "feedback" },
                        })
                      )
                    }
                    className="mt-3 text-xs font-bold text-cyan-200/80 hover:text-cyan-100"
                  >
                    Share feedback
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Failure State Details */}
          {isFailed && error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 flex flex-col gap-4"
            >
              <div className="flex gap-2 items-center text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Transaction Failed
              </div>

              <div className="text-xs text-white/70 leading-relaxed">
                <span className="font-semibold text-white/85">{error.title}: </span>
                {error.message}
              </div>

              <div className="text-xs p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/10 text-white/50 leading-relaxed">
                <span className="font-bold text-rose-400/90 block mb-0.5 uppercase tracking-wide text-[9px]">Recovery steps</span>
                {error.recovery}
              </div>

              <button
                type="button"
                onClick={() => setShowTechnicalDetails((value) => !value)}
                className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                {showTechnicalDetails ? "Hide technical details" : "View technical details"}
              </button>

              {showTechnicalDetails && (
                <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/25 p-3 text-[11px] leading-relaxed text-white/45">
                  {formatTechnicalDetails(error.originalError)}
                </pre>
              )}

              <button
                onClick={retryTx}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all font-semibold text-xs uppercase tracking-wider cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Transaction
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function getPromptKind(title: string): "swap" | "liquidity" | null {
  if (/^swap\b/i.test(title)) return "swap";
  if (/^add liquidity\b/i.test(title)) return "liquidity";
  return null;
}

function getPromptStorageKey(kind: "swap" | "liquidity") {
  return `luminadex_last_feedback_prompt_${kind}`;
}

function formatTechnicalDetails(originalError: unknown): string {
  if (!originalError) return "No technical details were returned.";
  if (originalError instanceof Error) {
    return originalError.stack || originalError.message;
  }
  try {
    return JSON.stringify(
      originalError,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    );
  } catch {
    return String(originalError);
  }
}
