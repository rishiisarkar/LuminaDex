"use client";

import { useCallback } from "react";
import { useGlobalWallet } from "@/context/WalletContext";
import { NETWORK_PASSPHRASE } from "@/lib/constants";

export function useWallet() {
  const { address, connect, disconnect, isLoading } = useGlobalWallet();

  const sign = useCallback(
    async (txXdr: string): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");
      const { signTransaction } = await import("@stellar/freighter-api");
      const result = await signTransaction(txXdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address,
      });
      if ("error" in result) throw new Error(result.error);
      return (result as { signedTxXdr: string }).signedTxXdr;
    },
    [address]
  );

  const connectWithReturn = useCallback(async () => {
    await connect();
    return address;
  }, [connect, address]);

  return {
    address,
    connect: connectWithReturn,
    sign,
    disconnect,
    connecting: isLoading,
  };
}

