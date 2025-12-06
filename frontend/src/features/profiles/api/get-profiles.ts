import { useQuery } from "@tanstack/react-query";
import { FullProfileSchema, type FullProfile } from "../types/profile-schema";
import { fullProfileToUIProfile, type UIProfile } from "../types/ui-profile";
import { fullProfileToSwipeProfile, type SwipeProfile } from "../types/swipe-profile";
import { apiFetch } from "@/lib/api-client";

/**
 * Manifest type for the profiles index
 */
interface ProfileManifest {
  profiles: Array<{
    id: string;
    filename: string;
  }>;
}

/**
 * Fetch the profile manifest (list of available profiles)
 */
async function fetchProfileManifest(): Promise<ProfileManifest> {
  const response = await fetch("/json/index.json");
  if (!response.ok) {
    throw new Error(`Failed to fetch profile manifest: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a single profile by ID from the static assets
 */
async function fetchFullProfileFromStatic(profileId: string): Promise<FullProfile> {
  const response = await fetch(`/json/${profileId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile ${profileId}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Validate the data against the schema
  const parsed = FullProfileSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Profile validation failed:", parsed.error);
    throw new Error(`Invalid profile data for ${profileId}`);
  }
  
  return parsed.data;
}

/**
 * Check if a profile has a valid image (non-empty profile_path)
 */
function hasProfileImage(profile: FullProfile): boolean {
  return !!profile.profile_path && profile.profile_path.trim() !== "";
}

/**
 * Fetch a single profile by ID - tries backend API first, falls back to static files
 */
async function fetchFullProfile(profileId: string): Promise<FullProfile> {
  // Try backend API first (for dynamically created profiles)
  try {
    const response = await apiFetch<{ profile: FullProfile }>(`/profiles/${profileId}`);
    const data = response.profile;
    
    // Validate the data against the schema
    const parsed = FullProfileSchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    // If validation fails, fall through to static files
  } catch {
    // Backend not available or profile not found, try static files
  }
  
  // Fall back to static files
  return fetchFullProfileFromStatic(profileId);
}

/**
 * Fetch all profiles and transform them to UI format
 * Filters out profiles without a profile_path (image)
 */
async function fetchAllUIProfiles(): Promise<UIProfile[]> {
  const manifest = await fetchProfileManifest();
  
  const profilesWithData = await Promise.all(
    manifest.profiles.map(async ({ id }) => {
      const fullProfile = await fetchFullProfile(id);
      return { fullProfile, id };
    })
  );
  
  // Filter out profiles without images
  const profilesWithImages = profilesWithData.filter(({ fullProfile }) => 
    hasProfileImage(fullProfile)
  );
  
  return profilesWithImages.map(({ fullProfile, id }) => {
    // Generate a random compatibility score for demo purposes
    // In a real app, this would be computed by the backend
    const compatibilityScore = Math.floor(Math.random() * 25) + 70; // 70-95
    return fullProfileToUIProfile(fullProfile, id, compatibilityScore);
  });
}

/**
 * React Query hook to fetch all profiles in UI format
 */
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: fetchAllUIProfiles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * React Query hook to fetch a single full profile
 */
export function useFullProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => {
      if (!profileId) throw new Error("Profile ID is required");
      return fetchFullProfile(profileId);
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * React Query hook to fetch a single profile in UI format
 */
export function useUIProfile(profileId: string | undefined, compatibilityScore?: number) {
  return useQuery({
    queryKey: ["ui-profile", profileId, compatibilityScore],
    queryFn: async () => {
      if (!profileId) throw new Error("Profile ID is required");
      const fullProfile = await fetchFullProfile(profileId);
      return fullProfileToUIProfile(fullProfile, profileId, compatibilityScore);
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch all profiles and transform them to swipe format
 * Filters out profiles without a profile_path (image)
 */
async function fetchAllSwipeProfiles(): Promise<SwipeProfile[]> {
  const manifest = await fetchProfileManifest();
  
  const profilesWithData = await Promise.all(
    manifest.profiles.map(async ({ id }) => {
      const fullProfile = await fetchFullProfile(id);
      return { fullProfile, id };
    })
  );
  
  // Filter out profiles without images
  const profilesWithImages = profilesWithData.filter(({ fullProfile }) => 
    hasProfileImage(fullProfile)
  );
  
  return profilesWithImages.map(({ fullProfile, id }) => {
    // Generate a random compatibility score for demo purposes
    const compatibilityScore = Math.floor(Math.random() * 25) + 70; // 70-95
    return fullProfileToSwipeProfile(fullProfile, id, compatibilityScore);
  });
}

/**
 * React Query hook to fetch all profiles in swipe format
 */
export function useSwipeProfiles() {
  return useQuery({
    queryKey: ["swipe-profiles"],
    queryFn: fetchAllSwipeProfiles,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

