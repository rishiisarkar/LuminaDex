"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  simulateContractRead,
  addressToScVal,
  buildContractTx,
  submitTransaction,
  isMissingContractFunctionError,
} from "@/lib/stellar";
import { PROFILE_CONTRACT_ADDRESS } from "@/lib/stellar/contracts";
import { useWallet } from "@/hooks/useWallet";
import { useTxTracker } from "@/context/TxTrackerContext";
import { scValToNative, xdr } from "@stellar/stellar-sdk";

interface UserProfileResult {
  nickname: string;
  isAvailable: boolean;
}

/** Read user profile from the deployed contract. */
async function fetchUserProfile(address: string): Promise<UserProfileResult> {
  try {
    const result = await simulateContractRead(PROFILE_CONTRACT_ADDRESS, "get_profile", [
      addressToScVal(address),
    ], { suppressMissingContractFunctionError: true });
    if (!result) return { nickname: "", isAvailable: true };
    return { nickname: String(scValToNative(result)), isAvailable: true };
  } catch (err) {
    if (isMissingContractFunctionError(err)) {
      return { nickname: "", isAvailable: false };
    }
    console.error("Failed to fetch on-chain profile:", err);
    return { nickname: "", isAvailable: true };
  }
}

export function useProfile(address: string | null) {
  const queryClient = useQueryClient();
  const { sign } = useWallet();
  const { trackTx } = useTxTracker();

  const query = useQuery<UserProfileResult>({
    queryKey: ["user-profile", address],
    queryFn: () => fetchUserProfile(address!),
    enabled: !!address,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (nickname: string) => {
      if (!address) throw new Error("Wallet not connected");

      await trackTx(`Update On-Chain Profile to "${nickname}"`, async (updateStep) => {
        // Step 1: Simulate and build
        updateStep("preparing");
        const tx = await buildContractTx(
          PROFILE_CONTRACT_ADDRESS,
          "set_profile",
          [
            addressToScVal(address),
            xdr.ScVal.scvString(nickname),
          ],
          address
        );
        const xdrString = tx.toXDR();

        // Step 2: Request signature
        updateStep("waiting_signature");
        const signedXdr = await sign(xdrString);

        // Step 3: Submit to network
        updateStep("submitting");
        
        // Step 4: Track consensus (submitTransaction automatically waits/polls)
        updateStep("pending");
        const response = await submitTransaction(signedXdr);

        return {
          hash: response.hash,
          ledger: response.ledger,
        };
      });
    },
    onSuccess: () => {
      // Invalidate queries to trigger instant UI refresh
      queryClient.invalidateQueries({ queryKey: ["user-profile", address] });
    },
  });

  return {
    nickname: query.data?.nickname ?? "",
    isAvailable: query.data?.isAvailable ?? true,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
}
