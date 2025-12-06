import { useQuery } from "@tanstack/react-query";
import {
  getAllMatches,
  getMatchesForUser,
  getMatchedUserId,
  areMatched,
  queryKeys,
  type Match,
} from "@/lib/storage";

/**
 * Query hook to get all matches for a user
 */
export function useMatches(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.matches.user(userId ?? ""),
    queryFn: () => getMatchesForUser(userId!),
    enabled: !!userId,
  });
}

/**
 * Query hook to get all matches (admin view)
 */
export function useAllMatches() {
  return useQuery({
    queryKey: queryKeys.matches.all,
    queryFn: getAllMatches,
  });
}

/**
 * Query hook to check if two users are matched
 */
export function useAreMatched(userA: string | null, userB: string | null) {
  return useQuery({
    queryKey: [...queryKeys.matches.all, "areMatched", userA, userB],
    queryFn: () => areMatched(userA!, userB!),
    enabled: !!userA && !!userB,
  });
}

/**
 * Helper to get the matched user ID from a match
 */
export { getMatchedUserId };

export type { Match };

