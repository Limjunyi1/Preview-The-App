import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

type BestieStartRequest = {
  userId: string;
  model?: string;
};

type BestieStartResponse = {
  session_id: string;
  opening_text: string;
};

type BestieReplyRequest = {
  sessionId: string;
  message: string;
};

type BestieReplyResponse = {
  reply: string;
};

type BestieFinalizeRequest = {
  sessionId: string;
};

type BestieFinalizeResponse = {
  updated_profile: Record<string, unknown>;
  bestie_insights: Record<string, unknown> | null;
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Mutation hook to start an AI Bestie session
 * Returns session_id and opening_text from the AI agent
 */
export function useBestieStart() {
  return useMutation<BestieStartResponse, Error, BestieStartRequest>({
    mutationFn: async ({ userId, model }) => {
      return apiFetch<BestieStartResponse>("/bestie/start", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          model: model,
        }),
      });
    },
  });
}

/**
 * Mutation hook to send a message to AI Bestie
 */
export function useBestieReply() {
  return useMutation<BestieReplyResponse, Error, BestieReplyRequest>({
    mutationFn: async ({ sessionId, message }) => {
      return apiFetch<BestieReplyResponse>("/bestie/reply", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
        }),
      });
    },
  });
}

/**
 * Mutation hook to finalize AI Bestie session
 * Returns updated profile and any insights
 */
export function useBestieFinalize() {
  return useMutation<BestieFinalizeResponse, Error, BestieFinalizeRequest>({
    mutationFn: async ({ sessionId }) => {
      return apiFetch<BestieFinalizeResponse>("/bestie/finalize", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });
    },
  });
}

export type {
  BestieStartRequest,
  BestieStartResponse,
  BestieReplyRequest,
  BestieReplyResponse,
  BestieFinalizeRequest,
  BestieFinalizeResponse,
};

