import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ============================================================================
// Types
// ============================================================================

type TranscriptEntry = {
  speaker: string;
  text: string;
};

type SimulationRun = {
  run_id: string;
  persona_a: {
    display_name: string;
    ai_summary: string;
  };
  persona_b: {
    display_name: string;
    ai_summary: string;
  };
  transcript: TranscriptEntry[];
  compatibility_score: number;
  high_points: string[];
  friction_points: string[];
  judge_summary: string;
  started_at: string;
  completed_at: string | null;
};

type RunSimulationRequest = {
  userA: string;
  userB: string;
  turns?: number;
  starter?: "a" | "b";
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Mutation hook to run a simulation between two users
 */
export function useRunSimulation() {
  return useMutation<SimulationRun, Error, RunSimulationRequest>({
    mutationFn: async ({ userA, userB, turns = 20, starter = "a" }) => {
      return apiFetch<SimulationRun>("/simulate/by-user", {
        method: "POST",
        body: JSON.stringify({
          user_a: userA,
          user_b: userB,
          turns,
          starter,
        }),
      });
    },
  });
}

/**
 * Query hook to fetch an existing simulation by run_id
 */
export function useSimulation(runId: string | null) {
  return useQuery({
    queryKey: ["simulation", runId],
    queryFn: () => apiFetch<SimulationRun>(`/simulate/${runId}`),
    enabled: !!runId,
    staleTime: Infinity, // Simulations don't change once created
  });
}

/**
 * Query hook to list all simulations
 */
export function useSimulationList(limit: number = 50) {
  return useQuery({
    queryKey: ["simulations", limit],
    queryFn: () =>
      apiFetch<{ runs: SimulationRun[]; next_cursor: string | null }>(
        `/simulate?limit=${limit}`
      ),
  });
}

export type { SimulationRun, TranscriptEntry, RunSimulationRequest };

