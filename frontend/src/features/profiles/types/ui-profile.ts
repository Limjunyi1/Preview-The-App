import type { FullProfile } from "./profile-schema";

/**
 * UI-friendly profile type that matches what the existing UI components expect.
 * This is derived from FullProfile but simplified for display purposes.
 */
export interface UIProfile {
  id: string;
  name: string;
  age: number;
  occupation: string; // derived from lifestyle or other context
  location: string;
  avatar: string; // placeholder URL since real data doesn't include photos
  tags: string[]; // derived from values, lifestyle, etc.
  compatibilityScore?: number; // computed separately, not in source data
}

/**
 * Extended UI profile for matching features that need status tracking
 */
export interface UIMatch extends UIProfile {
  status: "idle" | "simulating" | "completed";
}

/**
 * Transform a FullProfile into a UIProfile for display
 */
export function fullProfileToUIProfile(
  fullProfile: FullProfile,
  profileId: string,
  compatibilityScore?: number
): UIProfile {
  // Derive occupation from lifestyle or use a placeholder
  const occupation = deriveOccupation(fullProfile);
  
  // Generate tags from profile attributes
  const tags = deriveTags(fullProfile);
  
  // Use profile_path from JSON, fallback to placeholder
  const avatar = fullProfile.profile_path || getPlaceholderAvatar(profileId);

  return {
    id: profileId,
    name: fullProfile.profile.display_name,
    age: fullProfile.profile.age,
    occupation,
    location: fullProfile.profile.location,
    avatar,
    tags,
    compatibilityScore,
  };
}

/**
 * Derive an occupation-like string from the profile data
 */
function deriveOccupation(profile: FullProfile): string {
  // Try to extract from lifestyle or other fields
  // For now, use a combination of age/intent as fallback
  const intent = profile.relationship.intent;
  const socialEnergy = profile.lifestyle.social_energy;
  
  if (socialEnergy) {
    return `${capitalizeFirst(socialEnergy)}`;
  }
  
  if (intent) {
    return `Looking for ${intent}`;
  }
  
  return "Available";
}

/**
 * Derive display tags from profile attributes
 */
function deriveTags(profile: FullProfile): string[] {
  const tags: string[] = [];
  
  // Add relationship intent
  if (profile.relationship.intent) {
    tags.push(capitalizeFirst(profile.relationship.intent));
  }
  
  // Add lifestyle tags
  if (profile.lifestyle.weekend_default) {
    const weekend = profile.lifestyle.weekend_default;
    // Extract first meaningful phrase
    const shortWeekend = weekend.split(',')[0].split('.')[0];
    if (shortWeekend.length < 40) {
      tags.push(shortWeekend);
    }
  }
  
  if (profile.lifestyle.pets) {
    tags.push(profile.lifestyle.pets);
  }
  
  // Add value tags
  if (profile.values.other_values && profile.values.other_values.length > 0) {
    tags.push(...profile.values.other_values.slice(0, 2));
  }
  
  // Add family closeness if notable
  if (profile.values.family_closeness && profile.values.family_closeness.toLowerCase().includes('important')) {
    tags.push("Family-oriented");
  }
  
  // Add communication style
  if (profile.communication.love_languages && profile.communication.love_languages.length > 0) {
    tags.push(profile.communication.love_languages[0]);
  }
  
  // Limit to 5 most relevant tags
  return tags.slice(0, 5).map(tag => capitalizeFirst(tag));
}

/**
 * Get a placeholder avatar URL based on profile ID
 * In a real app, this would fetch actual profile photos
 */
function getPlaceholderAvatar(profileId: string): string {
  const avatars = {
    marvin: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    john: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    ling: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  };
  
  return avatars[profileId as keyof typeof avatars] || 
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop";
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

