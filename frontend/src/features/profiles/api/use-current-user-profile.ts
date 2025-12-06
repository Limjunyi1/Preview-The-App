import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { FullProfileSchema, type FullProfile } from "../types/profile-schema";
import { getCurrentUser } from "@/lib/storage";

// ============================================================================
// Types
// ============================================================================

type ProfileResponse = {
  profile: FullProfile;
};

type UpdateProfileRequest = {
  userId: string;
  profile: FullProfile;
};

// ============================================================================
// Query Keys
// ============================================================================

export const currentUserProfileKeys = {
  all: ["current-user-profile"] as const,
  detail: (userId: string) => ["current-user-profile", userId] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch the current user's profile from the backend API
 */
async function fetchCurrentUserProfile(userId: string): Promise<FullProfile> {
  const response = await apiFetch<ProfileResponse>(`/profiles/${userId}`);
  
  // Validate the response against our schema
  const parsed = FullProfileSchema.safeParse(response.profile);
  if (!parsed.success) {
    console.error("Profile validation failed:", parsed.error);
    throw new Error(`Invalid profile data for ${userId}`);
  }
  
  return parsed.data;
}

/**
 * Update the current user's profile on the backend
 */
async function updateProfile(userId: string, profile: FullProfile): Promise<FullProfile> {
  const response = await apiFetch<ProfileResponse>(`/profiles/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });
  
  return response.profile as FullProfile;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * React Query hook to fetch the current user's profile from the backend
 * This is different from useFullProfile which fetches from static files
 */
export function useCurrentUserProfile(userId?: string) {
  const resolvedUserId = userId ?? getCurrentUser();
  
  return useQuery({
    queryKey: currentUserProfileKeys.detail(resolvedUserId ?? ""),
    queryFn: () => {
      if (!resolvedUserId) throw new Error("User ID is required");
      return fetchCurrentUserProfile(resolvedUserId);
    },
    enabled: !!resolvedUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook to update the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation<FullProfile, Error, UpdateProfileRequest>({
    mutationFn: ({ userId, profile }) => updateProfile(userId, profile),
    onSuccess: (data, variables) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(
        currentUserProfileKeys.detail(variables.userId),
        data
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: currentUserProfileKeys.all });
    },
  });
}

/**
 * Helper to set the current user's profile in the cache
 * Useful after onboarding when we already have the profile data
 */
export function useSetCurrentUserProfileCache() {
  const queryClient = useQueryClient();
  
  return (userId: string, profile: FullProfile) => {
    queryClient.setQueryData(currentUserProfileKeys.detail(userId), profile);
  };
}

export type { FullProfile, UpdateProfileRequest };

