import type { FullProfile } from "./profile-schema";

/**
 * Swiping-specific profile type with extended fields for the card UI
 */
export interface SwipeProfile {
  id: string;
  name: string;
  age: number;
  pronouns: string;
  job: string;
  education: string;
  distance: string;
  photo: string;
  compatibility: number;
  shared: string[];
  friction: string;
  prompt: string;
  vibe: string;
}

/**
 * Transform a FullProfile into a SwipeProfile for the swiping interface
 */
export function fullProfileToSwipeProfile(
  fullProfile: FullProfile,
  profileId: string,
  compatibilityScore?: number
): SwipeProfile {
  // Derive job from occupation or lifestyle
  const job = deriveJob(fullProfile);
  
  // Generate shared wins from profile attributes
  const shared = deriveSharedWins(fullProfile);
  
  // Generate friction point from profile differences
  const friction = deriveFriction(fullProfile);
  
  // Generate a prompt from profile data
  const prompt = derivePrompt(fullProfile);
  
  // Generate vibe from profile characteristics
  const vibe = deriveVibe(fullProfile);
  
  // Use profile_path from JSON, fallback to placeholder
  const photo = fullProfile.profile_path || getPlaceholderAvatar(profileId);
  
  return {
    id: profileId,
    name: fullProfile.profile.display_name,
    age: fullProfile.profile.age,
    pronouns: fullProfile.profile.pronouns || derivePronouns(fullProfile),
    job,
    education: "University", // Placeholder since not in data
    distance: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} km away`,
    photo,
    compatibility: compatibilityScore || Math.floor(Math.random() * 25) + 70,
    shared,
    friction,
    prompt,
    vibe,
  };
}

/**
 * Derive job/occupation from profile
 */
function deriveJob(profile: FullProfile): string {
  const socialEnergy = profile.lifestyle.social_energy;
  const intent = profile.relationship.intent;
  
  // Create a job description based on profile traits
  if (socialEnergy?.toLowerCase().includes('extrovert')) {
    return "Social Professional";
  } else if (socialEnergy?.toLowerCase().includes('introvert')) {
    return "Creative Professional";
  } else if (intent?.toLowerCase().includes('casual')) {
    return "Free Spirit";
  } else {
    return "Professional";
  }
}

/**
 * Derive shared wins/compatibility points from profile
 */
function deriveSharedWins(profile: FullProfile): string[] {
  const wins: string[] = [];
  
  // Add relationship-based wins
  if (profile.relationship.intent) {
    wins.push(`Both looking for ${profile.relationship.intent}`);
  }
  
  // Add lifestyle wins
  if (profile.lifestyle.weekend_default) {
    const weekend = profile.lifestyle.weekend_default.split(',')[0].split('.')[0];
    if (weekend.length < 50) {
      wins.push(weekend);
    }
  }
  
  if (profile.lifestyle.pets) {
    wins.push(profile.lifestyle.pets);
  }
  
  // Add communication wins
  if (profile.communication.conflict_style) {
    wins.push(`${capitalizeFirst(profile.communication.conflict_style)} conflict style`);
  }
  
  if (profile.communication.love_languages && profile.communication.love_languages.length > 0) {
    wins.push(`Love language: ${profile.communication.love_languages[0]}`);
  }
  
  // Add value wins
  if (profile.values.family_closeness && profile.values.family_closeness.toLowerCase().includes('important')) {
    wins.push("Family-oriented");
  }
  
  if (profile.values.money_mindset) {
    wins.push(`${capitalizeFirst(profile.values.money_mindset)} with money`);
  }
  
  return wins.slice(0, 5);
}

/**
 * Derive a potential friction point from profile
 */
function deriveFriction(profile: FullProfile): string {
  // Generate realistic friction based on profile traits
  if (profile.lifestyle.travel_style?.toLowerCase().includes('spontaneous')) {
    return "Loves spontaneous adventures; you might prefer planning ahead.";
  }
  
  if (profile.lifestyle.social_energy?.toLowerCase().includes('extrovert')) {
    return "Thrives in social settings; you might need more quiet time.";
  }
  
  if (profile.lifestyle.social_energy?.toLowerCase().includes('introvert')) {
    return "Prefers smaller gatherings; you might enjoy larger social events.";
  }
  
  if (profile.relationship.pace_to_meet?.toLowerCase().includes('quickly')) {
    return "Likes to meet up quickly; you might prefer to chat online first.";
  }
  
  if (profile.values.openness_to_kids?.toLowerCase().includes('want')) {
    return "Definitely wants kids; make sure you're aligned on this.";
  }
  
  return "Different weekend routines; but compromise makes it work.";
}

/**
 * Derive a prompt/conversation starter from profile
 */
function derivePrompt(profile: FullProfile): string {
  if (profile.lifestyle.weekend_default) {
    return `Perfect weekend: ${profile.lifestyle.weekend_default.slice(0, 80)}...`;
  }
  
  if (profile.lifestyle.travel_style) {
    return `Travel style: ${profile.lifestyle.travel_style}`;
  }
  
  if (profile.AI_summary) {
    return profile.AI_summary.slice(0, 100) + "...";
  }
  
  return `Looking for ${profile.relationship.intent || "meaningful connection"}.`;
}

/**
 * Derive a vibe descriptor from profile
 */
function deriveVibe(profile: FullProfile): string {
  const traits: string[] = [];
  
  if (profile.lifestyle.social_energy) {
    traits.push(profile.lifestyle.social_energy);
  }
  
  if (profile.lifestyle.pets?.toLowerCase().includes('dog')) {
    return "Dog lover";
  } else if (profile.lifestyle.pets?.toLowerCase().includes('cat')) {
    return "Cat person";
  }
  
  if (profile.lifestyle.weekend_default?.toLowerCase().includes('coffee')) {
    return "Coffee enthusiast";
  } else if (profile.lifestyle.weekend_default?.toLowerCase().includes('hike')) {
    return "Nature lover";
  } else if (profile.lifestyle.weekend_default?.toLowerCase().includes('party')) {
    return "Social butterfly";
  }
  
  if (profile.values.family_closeness?.toLowerCase().includes('important')) {
    return "Family-focused";
  }
  
  return traits.length > 0 ? capitalizeFirst(traits[0]) : "Genuine connection";
}

/**
 * Derive pronouns from profile gender if not explicitly set
 */
function derivePronouns(profile: FullProfile): string {
  const gender = profile.profile.gender?.toLowerCase();
  
  if (gender?.includes('male') && !gender.includes('female')) {
    return "He/Him";
  } else if (gender?.includes('female')) {
    return "She/Her";
  } else {
    return "They/Them";
  }
}

/**
 * Get a placeholder avatar URL based on profile ID
 */
function getPlaceholderAvatar(profileId: string): string {
  const avatars = {
    marvin: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    john: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    ling: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
    sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
  };
  
  return avatars[profileId as keyof typeof avatars] || 
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=1200&q=80";
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

