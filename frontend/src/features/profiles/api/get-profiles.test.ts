import { describe, it, expect, beforeEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfiles, useFullProfile, useUIProfile, useSwipeProfiles } from "./get-profiles";
import type { ReactNode } from "react";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("Profile API Hooks", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("useProfiles", () => {
    it("should fetch and transform all profiles successfully", async () => {
      // Mock the manifest response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profiles: [
            { id: "marvin", filename: "marvin.json" },
            { id: "john", filename: "john.json" },
          ],
        }),
      });

      // Mock the individual profile responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profile: {
              display_name: "Marvin",
              age: 23,
              gender: "male",
              pronouns: "he/him",
              location: "Kuala Lumpur",
              orientation: "straight",
            },
            relationship: { intent: "long-term" },
            lifestyle: { social_energy: "introvert" },
            values: {},
            communication: {},
            empathy_accountability: {},
            dealbreakers: [],
            must_haves: [],
            agent_persona: {},
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            profile: {
              display_name: "John",
              age: 23,
              gender: "male",
              location: "Kuala Lumpur, Malaysia",
              orientation: "sexual that can lead to romantic",
            },
            relationship: { intent: "open to see" },
            lifestyle: {},
            values: {},
            communication: {},
            empathy_accountability: {},
            dealbreakers: [],
            must_haves: [],
            agent_persona: {},
          }),
        });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProfiles(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]).toHaveProperty("id", "marvin");
      expect(result.current.data?.[0]).toHaveProperty("name", "Marvin");
      expect(result.current.data?.[0]).toHaveProperty("age", 23);
    });

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useProfiles(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("useFullProfile", () => {
    it("should fetch a single full profile", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            display_name: "Sarah",
            age: 24,
            gender: "Female",
            pronouns: "she/her",
            location: "Kuala Lumpur, Malaysia",
            orientation: "Seeking men for a long-term serious relationship",
          },
          relationship: { intent: "long-term" },
          lifestyle: { social_energy: "Introverted" },
          values: {},
          communication: {},
          empathy_accountability: {},
          dealbreakers: [],
          must_haves: [],
          agent_persona: {},
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useFullProfile("sarah"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveProperty("profile.display_name", "Sarah");
      expect(result.current.data).toHaveProperty("profile.age", 24);
    });

    it("should not fetch if profileId is undefined", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useFullProfile(undefined), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("useUIProfile", () => {
    it("should transform full profile to UI profile", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            display_name: "Ling",
            age: 22,
            gender: "male",
            pronouns: "he/him",
            location: "Subang Jaya, Malaysia",
            orientation: "straight",
          },
          relationship: { intent: "casual" },
          lifestyle: { social_energy: "extrovert", pets: "dog person" },
          values: {},
          communication: {},
          empathy_accountability: {},
          dealbreakers: [],
          must_haves: [],
          agent_persona: {},
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useUIProfile("ling", 85), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toMatchObject({
        id: "ling",
        name: "Ling",
        age: 22,
        location: "Subang Jaya, Malaysia",
        compatibilityScore: 85,
      });
      expect(result.current.data?.tags).toBeDefined();
      expect(result.current.data?.avatar).toBeDefined();
    });
  });

  describe("useSwipeProfiles", () => {
    it("should transform profiles to swipe format", async () => {
      // Mock the manifest response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profiles: [{ id: "john", filename: "john.json" }],
        }),
      });

      // Mock the profile response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: {
            display_name: "John",
            age: 23,
            gender: "male",
            location: "Kuala Lumpur, Malaysia",
            orientation: "straight",
          },
          relationship: { intent: "open to see" },
          lifestyle: { weekend_default: "motorcycle rides, cycling" },
          values: {},
          communication: {},
          empathy_accountability: {},
          dealbreakers: [],
          must_haves: [],
          agent_persona: {},
        }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSwipeProfiles(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toMatchObject({
        id: "john",
        name: "John",
        age: 23,
      });
      // Swipe-specific fields
      expect(result.current.data?.[0]).toHaveProperty("pronouns");
      expect(result.current.data?.[0]).toHaveProperty("job");
      expect(result.current.data?.[0]).toHaveProperty("shared");
      expect(result.current.data?.[0]).toHaveProperty("friction");
      expect(result.current.data?.[0]).toHaveProperty("vibe");
    });
  });
});

