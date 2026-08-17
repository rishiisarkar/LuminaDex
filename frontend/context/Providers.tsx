"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/components/Toast";
import { TxTrackerProvider } from "@/context/TxTrackerContext";
import { EventSyncProvider } from "@/context/EventSyncProvider";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";

const LuminaAssistant = dynamic(
  () => import("@/components/assistant/LuminaAssistant"),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient once per session inside a useState initializer
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ToastProvider>
          <TxTrackerProvider>
            <OnboardingProvider>
              <EventSyncProvider>{children}</EventSyncProvider>
              <LuminaAssistant />
            </OnboardingProvider>
          </TxTrackerProvider>
        </ToastProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
