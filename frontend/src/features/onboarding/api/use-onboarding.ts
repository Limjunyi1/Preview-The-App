import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

type OnboardingStartRequest = {
  userId: string;
  model?: string;
};

type OnboardingStartResponse = {
  session_id: string;
  opening_text: string;
};

type OnboardingReplyRequest = {
  sessionId: string;
  message: string;
};

type OnboardingReplyResponse = {
  reply: string;
  done: boolean;
  persona_json: Record<string, unknown> | null;
};

type OnboardingFinalizeRequest = {
  sessionId: string;
};

type OnboardingFinalizeResponse = {
  persona_json: Record<string, unknown>;
};

type TranscribeUploadResponse = {
  transcript: string;
  duration_seconds?: number | null;
  message?: string;
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Mutation hook to start an onboarding session
 * Returns session_id and opening_text from the AI agent
 */
export function useOnboardingStart() {
  return useMutation<OnboardingStartResponse, Error, OnboardingStartRequest>({
    mutationFn: async ({ userId, model }) => {
      return apiFetch<OnboardingStartResponse>("/onboarding/start", {
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
 * Mutation hook to send a message during onboarding
 * Returns AI reply and whether onboarding is done
 */
export function useOnboardingReply() {
  return useMutation<OnboardingReplyResponse, Error, OnboardingReplyRequest>({
    mutationFn: async ({ sessionId, message }) => {
      return apiFetch<OnboardingReplyResponse>("/onboarding/reply", {
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
 * Mutation hook to manually finalize onboarding and get persona
 * Usually not needed if onboarding auto-finalizes via reply
 */
export function useOnboardingFinalize() {
  return useMutation<OnboardingFinalizeResponse, Error, OnboardingFinalizeRequest>({
    mutationFn: async ({ sessionId }) => {
      return apiFetch<OnboardingFinalizeResponse>("/onboarding/finalize", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });
    },
  });
}

/**
 * Mutation hook to transcribe an uploaded audio blob (browser MediaRecorder)
 */
export function useTranscribeUpload() {
  return useMutation<TranscribeUploadResponse, Error, { file: Blob; model?: string; prompt?: string }>({
    mutationFn: async ({ file, model, prompt }) => {
      const formData = new FormData();
      formData.append("file", file, "recording.webm");
      if (model) formData.append("model", model);
      if (prompt) formData.append("prompt", prompt);

      return apiFetch<TranscribeUploadResponse>("/transcribe/upload", {
        method: "POST",
        body: formData,
      });
    },
  });
}

export type {
  OnboardingStartRequest,
  OnboardingStartResponse,
  OnboardingReplyRequest,
  OnboardingReplyResponse,
  OnboardingFinalizeRequest,
  OnboardingFinalizeResponse,
  TranscribeUploadResponse,
};

