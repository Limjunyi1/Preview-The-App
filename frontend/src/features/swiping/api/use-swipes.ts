import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSwipes,
  recordSwipe,
  hasSwipedOn,
  getUnswipedProfiles,
  queryKeys,
  type Swipe,
} from "@/lib/storage";

/**
 * Query hook to get all swipes for a user
 */
export function useSwipes(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.swipes.user(userId ?? ""),
    queryFn: () => getSwipes().filter((s) => s.from === userId),
    enabled: !!userId,
  });
}

/**
 * Query hook to check if a user has swiped on a profile
 */
export function useHasSwipedOn(from: string | null, to: string) {
  return useQuery({
    queryKey: [...queryKeys.swipes.user(from ?? ""), "hasSwipedOn", to],
    queryFn: () => hasSwipedOn(from!, to),
    enabled: !!from,
  });
}

/**
 * Query hook to get unswiped profile IDs for a user
 */
export function useUnswipedProfiles(userId: string | null, allProfileIds: string[]) {
  return useQuery({
    queryKey: [...queryKeys.swipes.user(userId ?? ""), "unswiped", allProfileIds],
    queryFn: () => getUnswipedProfiles(userId!, allProfileIds),
    enabled: !!userId && allProfileIds.length > 0,
  });
}

type RecordSwipeParams = {
  from: string;
  to: string;
  direction: "left" | "right";
};

type RecordSwipeResult = {
  isMatch: boolean;
};

/**
 * Mutation hook to record a swipe
 * Returns { isMatch: true } if the swipe created a mutual match
 */
export function useRecordSwipe() {
  const queryClient = useQueryClient();

  return useMutation<RecordSwipeResult, Error, RecordSwipeParams>({
    mutationFn: ({ from, to, direction }) => {
      const isMatch = recordSwipe(from, to, direction);
      return Promise.resolve({ isMatch });
    },
    onSuccess: (_, variables) => {
      // Invalidate swipes cache for this user
      queryClient.invalidateQueries({
        queryKey: queryKeys.swipes.user(variables.from),
      });
      // Invalidate matches cache for both users (in case of match)
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.user(variables.from),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.user(variables.to),
      });
    },
  });
}

export type { Swipe };

