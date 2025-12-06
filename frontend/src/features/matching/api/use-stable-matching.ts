import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type StableMatchingResponse = {
  matches: Record<string, string>; // user_id -> matched_user_id
  unmatched: string[];
  algorithm: string;
  current_user_match: string | null; // The match for the requesting user
};

export type StableMatchingRequest = {
  currentUserId: string;
  preferences?: string[]; // Ordered list of profile IDs (most preferred first)
};

export const matchingKeys = {
  stable: (userId: string) => ["matching", "stable", userId] as const,
};

/**
 * Mutation hook to run stable matching using Gale-Shapley algorithm.
 * 
 * Uses swipe-based preferences:
 * - Static profiles: hardcoded preferences (fast)
 * - New users: preferences from right swipes (ordered by swipe time)
 * 
 * @returns Mutation to trigger stable matching
 */
export function useStableMatchingMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<StableMatchingResponse, Error, StableMatchingRequest>({
    mutationFn: async ({ currentUserId, preferences }): Promise<StableMatchingResponse> => {
      if (!currentUserId) {
        throw new Error("User ID is required");
      }
      return apiFetch("/matching/stable", {
        method: "POST",
        body: JSON.stringify({ 
          current_user_id: currentUserId,
          preferences: preferences ?? null,
        }),
      });
    },
    onSuccess: (data, variables) => {
      // Cache the result
      queryClient.setQueryData(
        matchingKeys.stable(variables.currentUserId), 
        data
      );
    },
  });
}

/**
 * Query hook to get cached stable matching results.
 * Use useStableMatchingMutation to trigger matching first.
 * 
 * @param currentUserId - The ID of the current logged-in user
 */
export function useStableMatching(currentUserId: string | null) {
  return useQuery({
    queryKey: matchingKeys.stable(currentUserId ?? ""),
    queryFn: async (): Promise<StableMatchingResponse> => {
      if (!currentUserId) {
        throw new Error("User ID is required");
      }
      return apiFetch("/matching/stable", {
        method: "POST",
        body: JSON.stringify({ current_user_id: currentUserId }),
      });
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Helper to get the stable match for the current user.
 * Now uses the `current_user_match` field directly from the response.
 */
export function getStableMatchForUser(
  data: StableMatchingResponse | undefined
): string | null {
  if (!data) return null;
  return data.current_user_match;
}
