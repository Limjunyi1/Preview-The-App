/**
 * localStorage utilities for DatesDraft POC
 * 
 * Handles persistence of:
 * - Swipes (like/pass decisions)
 * - Matches (mutual right-swipes)
 * - Chat messages (per match)
 * - Current user session
 * 
 * Usage: Wrap these functions with React Query hooks in feature api/ folders
 * for consistent data fetching patterns across the app.
 * 
 * @see /frontend/docs/state-management.md
 * @see /frontend/docs/api-layer.md
 */

// Storage keys
const STORAGE_KEYS = {
  SWIPES: "datesdraft_swipes",
  MATCHES: "datesdraft_matches",
  CURRENT_USER: "datesdraft_current_user",
  CHAT_PREFIX: "datesdraft_chat_",
} as const;

// ============================================================================
// React Query Key Factories
// Use these when creating React Query hooks in feature api/ folders
// ============================================================================

export const queryKeys = {
  swipes: {
    all: ["swipes"] as const,
    user: (userId: string) => ["swipes", userId] as const,
  },
  matches: {
    all: ["matches"] as const,
    user: (userId: string) => ["matches", userId] as const,
  },
  chat: {
    all: ["chat"] as const,
    conversation: (userA: string, userB: string) => {
      const sorted = [userA, userB].sort();
      return ["chat", sorted[0], sorted[1]] as const;
    },
  },
  currentUser: ["currentUser"] as const,
} as const;

// Types
export type Swipe = {
  from: string;
  to: string;
  direction: "left" | "right";
  timestamp: string;
};

export type Match = {
  users: [string, string];
  matchedAt: string;
};

export type ChatMessage = {
  id: string;
  sender: "user" | "match";
  text: string;
  timestamp: number;
};

// ============================================================================
// Swipes
// ============================================================================

/**
 * Get all recorded swipes
 */
export function getSwipes(): Swipe[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SWIPES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Record a swipe decision and check for mutual match
 * @returns true if this created a new match
 */
export function recordSwipe(
  from: string,
  to: string,
  direction: "left" | "right"
): boolean {
  const swipes = getSwipes();

  // Check if already swiped
  const existingSwipe = swipes.find((s) => s.from === from && s.to === to);
  if (existingSwipe) {
    return false; // Already swiped on this person
  }

  // Add the swipe
  swipes.push({
    from,
    to,
    direction,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.SWIPES, JSON.stringify(swipes));

  // Check for mutual match (both swiped right)
  if (direction === "right") {
    const mutualSwipe = swipes.find(
      (s) => s.from === to && s.to === from && s.direction === "right"
    );
    if (mutualSwipe) {
      addMatch(from, to);
      return true; // It's a match!
    }
  }

  return false;
}

/**
 * Check if user has already swiped on a profile
 */
export function hasSwipedOn(from: string, to: string): boolean {
  const swipes = getSwipes();
  return swipes.some((s) => s.from === from && s.to === to);
}

/**
 * Get profiles the user hasn't swiped on yet
 */
export function getUnswipedProfiles(userId: string, allProfileIds: string[]): string[] {
  const swipes = getSwipes();
  const swipedIds = swipes
    .filter((s) => s.from === userId)
    .map((s) => s.to);
  return allProfileIds.filter((id) => id !== userId && !swipedIds.includes(id));
}

// ============================================================================
// Matches
// ============================================================================

/**
 * Get all matches
 */
export function getAllMatches(): Match[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get matches for a specific user
 */
export function getMatchesForUser(userId: string): Match[] {
  const matches = getAllMatches();
  return matches.filter((m) => m.users.includes(userId));
}

/**
 * Get the other user ID from a match
 */
export function getMatchedUserId(match: Match, currentUserId: string): string {
  return match.users.find((id) => id !== currentUserId) ?? match.users[0];
}

/**
 * Check if two users are matched
 */
export function areMatched(userA: string, userB: string): boolean {
  const matches = getAllMatches();
  return matches.some(
    (m) => m.users.includes(userA) && m.users.includes(userB)
  );
}

/**
 * Add a match (internal - called by recordSwipe)
 */
function addMatch(userA: string, userB: string): void {
  const matches = getAllMatches();
  const exists = matches.some(
    (m) => m.users.includes(userA) && m.users.includes(userB)
  );

  if (!exists) {
    matches.push({
      users: [userA, userB],
      matchedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }
}

// ============================================================================
// Chat Messages
// ============================================================================

/**
 * Get chat key for a match (sorted user IDs for consistency)
 */
function getChatKey(userA: string, userB: string): string {
  const sorted = [userA, userB].sort();
  return `${STORAGE_KEYS.CHAT_PREFIX}${sorted[0]}_${sorted[1]}`;
}

/**
 * Get chat messages for a match
 */
export function getChatMessages(userA: string, userB: string): ChatMessage[] {
  try {
    const key = getChatKey(userA, userB);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save a chat message
 */
export function saveChatMessage(
  userA: string,
  userB: string,
  message: Omit<ChatMessage, "id" | "timestamp">
): ChatMessage {
  const key = getChatKey(userA, userB);
  const messages = getChatMessages(userA, userB);

  const newMessage: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
  };

  messages.push(newMessage);
  localStorage.setItem(key, JSON.stringify(messages));

  return newMessage;
}

/**
 * Clear chat history for a match
 */
export function clearChatMessages(userA: string, userB: string): void {
  const key = getChatKey(userA, userB);
  localStorage.removeItem(key);
}

// ============================================================================
// Current User Session
// ============================================================================

/**
 * Get current logged-in user ID
 */
export function getCurrentUser(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Set current logged-in user ID
 */
export function setCurrentUser(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

/**
 * Clear current user (logout)
 */
export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ============================================================================
// Utility
// ============================================================================

/**
 * Clear all DatesDraft data from localStorage
 */
export function clearAllData(): void {
  // Get all keys
  const keys = Object.keys(localStorage);

  // Remove DatesDraft keys
  keys.forEach((key) => {
    if (key.startsWith("datesdraft_")) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Export all data (for debugging)
 */
export function exportAllData(): {
  swipes: Swipe[];
  matches: Match[];
  currentUser: string | null;
} {
  return {
    swipes: getSwipes(),
    matches: getAllMatches(),
    currentUser: getCurrentUser(),
  };
}

