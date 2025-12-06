# Frontend-Backend Integration Plan

This document outlines the architecture and integration tasks for the DatesDraft POC.

> **Reference**: Follow `/frontend/docs/` for all project standards, state management patterns, and API layer guidelines.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  • Reads profiles from static JSON (/public/profiles/)      │
│  • Stores swipes/matches/chat in localStorage               │
│  • Uses React Query for all data fetching/caching           │
│  • Calls backend ONLY for AI features                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP API (AI features only)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  AI Logic Only:                                             │
│  • Onboarding agent                                         │
│  • AI Bestie                                                │
│  • Date simulation                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Reads
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     JSON FILES (Repo)                       │
│  /profiles/           - User profile data                   │
│  /Prompts/            - AI prompt templates                 │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

- **AI logic → Backend**: Onboarding, AI Bestie, and simulations require backend
- **App data → Frontend (localStorage)**: Swipes, matches, chat messages stored in browser
- **Profile data → Static JSON**: Read from `/public/profiles/` (copied from `/profiles/`)
- **No auth required**: This is a proof-of-concept

---

## State Management

> **Reference**: `/frontend/docs/state-management.md`

Follow the state categorization from project standards:

| State Type | What | Solution | Location |
|------------|------|----------|----------|
| **Component State** | UI interactions, form inputs, modals | `useState`, `useReducer` | Component-level |
| **Server Cache State** | Profiles, AI responses, simulations | React Query (`useQuery`, `useMutation`) | Feature `api/` folders |
| **Application State** | Current user, theme, notifications | Context or Zustand | `src/stores/` or feature `stores/` |
| **Form State** | Questionnaire answers | React Hook Form + Zod | Component-level |
| **URL State** | Route params, query strings | React Router | Routes |

### localStorage as "Server Cache"

For POC, localStorage acts as our "server" for swipes/matches/chat. Wrap localStorage operations with **React Query** for:
- Consistent data fetching patterns across the app
- Automatic cache invalidation
- Loading/error states handled uniformly

---

## Feature Structure

> **Reference**: `/frontend/docs/project-structure.md`

### New Features to Create

```
src/features/
├── swiping/                    # NEW: Swiping feature
│   ├── api/
│   │   ├── use-swipes.ts       # React Query hooks for swipes
│   │   └── use-matches.ts      # React Query hooks for matches
│   ├── components/
│   │   └── swipe-card.tsx
│   ├── stores/
│   │   └── current-user-store.ts  # Zustand store for current user
│   └── types/
│       └── swipe.ts
│
├── chat/                       # EXISTING: Extend for localStorage
│   ├── api/
│   │   └── use-messages.ts     # React Query hooks for chat messages
│   └── types/
│       └── message.ts
│
├── onboarding/                 # NEW: Backend AI integration
│   ├── api/
│   │   ├── use-start-onboarding.ts
│   │   └── use-send-message.ts
│   └── types/
│       └── session.ts
│
├── bestie/                     # NEW: Backend AI integration
│   ├── api/
│   │   ├── use-start-bestie.ts
│   │   └── use-send-message.ts
│   └── types/
│       └── session.ts
│
└── simulation/                 # NEW: Backend AI integration
    ├── api/
    │   ├── use-run-simulation.ts
    │   └── use-get-simulation.ts
    └── types/
        └── simulation.ts
```

### Unidirectional Flow

```
shared (lib/, hooks/, components/) 
    ↓
features (profiles/, swiping/, chat/, onboarding/, bestie/, simulation/)
    ↓
app (routes/)
```

- ✅ Features import from shared
- ✅ App imports from features and shared
- ❌ Features do NOT import from other features
- ❌ Shared does NOT import from features or app

---

## API Layer Patterns

> **Reference**: `/frontend/docs/api-layer.md`

### Pattern 1: localStorage Data (Swipes, Matches, Chat)

Each API hook should include:
1. **Types** - TypeScript interfaces
2. **Storage functions** - Read/write to localStorage (in `src/lib/storage.ts`)
3. **React Query hooks** - Wrap storage functions

**Example: `src/features/swiping/api/use-swipes.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSwipes, recordSwipe, type Swipe } from "@/lib/storage";

// Query key factory
export const swipeKeys = {
  all: ["swipes"] as const,
  user: (userId: string) => [...swipeKeys.all, userId] as const,
};

// Query hook - fetch swipes
export function useSwipes(userId: string) {
  return useQuery({
    queryKey: swipeKeys.user(userId),
    queryFn: () => getSwipes().filter(s => s.from === userId),
  });
}

// Mutation hook - record swipe
export function useRecordSwipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ from, to, direction }: { from: string; to: string; direction: "left" | "right" }) => {
      const isMatch = recordSwipe(from, to, direction);
      return Promise.resolve({ isMatch });
    },
    onSuccess: (_, variables) => {
      // Invalidate swipes cache
      queryClient.invalidateQueries({ queryKey: swipeKeys.user(variables.from) });
      // Invalidate matches cache if needed
      queryClient.invalidateQueries({ queryKey: ["matches", variables.from] });
    },
  });
}
```

### Pattern 2: Backend AI Data (Onboarding, Bestie, Simulation)

Use the existing `src/lib/api-client.ts` for backend calls.

**Example: `src/features/simulation/api/use-run-simulation.ts`**

```typescript
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

type SimulationRequest = {
  user_a: string;
  user_b: string;
  turns?: number;
  starter?: "a" | "b";
};

type SimulationResponse = {
  run_id: string;
  transcript: Array<{ speaker: string; text: string }>;
  compatibility_score: number;
  // ... other fields
};

export function useRunSimulation() {
  return useMutation({
    mutationFn: async (request: SimulationRequest): Promise<SimulationResponse> => {
      return apiFetch("/simulate/by-user", {
        method: "POST",
        body: JSON.stringify(request),
      });
    },
  });
}
```

---

## Data Storage

### Static JSON (Read-Only)

| Data | Location | Access |
|------|----------|--------|
| User profiles | `/public/profiles/*.json` | React Query via `useProfiles()` |
| Profile manifest | `/public/profiles/index.json` | React Query via `useProfiles()` |

### localStorage Schema

> **Implementation**: `src/lib/storage.ts`

**Swipes** (`datesdraft_swipes`):
```typescript
type Swipe = {
  from: string;      // user ID who swiped
  to: string;        // user ID who was swiped on
  direction: "left" | "right";
  timestamp: string; // ISO date
};
```

**Matches** (`datesdraft_matches`):
```typescript
type Match = {
  users: [string, string];  // both user IDs
  matchedAt: string;        // ISO date
};
```

**Chat Messages** (`datesdraft_chat_{sortedUserIds}`):
```typescript
type ChatMessage = {
  id: string;
  sender: "user" | "match";
  text: string;
  timestamp: number;
};
```

**Current User** (`datesdraft_current_user`):
```typescript
type CurrentUser = string; // user ID
```

---

## Backend API (AI Features Only)

### Endpoints

| Endpoint | Method | Purpose | React Query Hook |
|----------|--------|---------|------------------|
| `/health` | GET | Health check | — |
| `/profiles/{user_id}` | GET | Get profile (for AI context) | `useProfile()` |
| `/onboarding/start` | POST | Start onboarding session | `useStartOnboarding()` |
| `/onboarding/reply` | POST | Send message during onboarding | `useSendOnboardingMessage()` |
| `/onboarding/finalize` | POST | Finalize onboarding | `useFinalizeOnboarding()` |
| `/bestie/start` | POST | Start AI Bestie session | `useStartBestie()` |
| `/bestie/reply` | POST | Send message to Bestie | `useSendBestieMessage()` |
| `/bestie/finalize` | POST | Finalize Bestie session | `useFinalizeBestie()` |
| `/simulate/by-user` | POST | Run simulation | `useRunSimulation()` |
| `/simulate/{run_id}` | GET | Get simulation result | `useSimulation()` |

---

## Implementation Checklist

### Phase 1: Core Infrastructure

- [x] Create `src/lib/storage.ts` - localStorage utilities
- [ ] Create `src/features/swiping/` feature structure
- [ ] Create `src/features/swiping/api/use-swipes.ts` - React Query hooks
- [ ] Create `src/features/swiping/api/use-matches.ts` - React Query hooks
- [ ] Create `src/stores/current-user-store.ts` - Zustand store for current user

### Phase 2: Swiping & Matching

- [ ] Wire `swiping.tsx` route to use `useRecordSwipe()` mutation
- [ ] Wire `dashboard.tsx` to use `useMatches()` query
- [ ] Add match celebration UI when `isMatch` returns true

### Phase 3: Chat

- [ ] Create `src/features/chat/api/use-messages.ts` - React Query hooks
- [ ] Wire `chat.tsx` route to use localStorage-backed hooks

### Phase 4: AI Features (Backend)

- [ ] Create `src/features/onboarding/api/` hooks
- [ ] Wire `questionnaire.tsx` to backend `/onboarding/*` endpoints
- [ ] Create `src/features/bestie/api/` hooks
- [ ] Wire dashboard Bestie chat to backend `/bestie/*` endpoints
- [ ] Create `src/features/simulation/api/` hooks
- [ ] Wire simulation button to backend `/simulate/by-user` endpoint

---

## Running the Application

### Frontend Only (Profiles, Swiping, Chat)

```bash
cd frontend
npm run dev
```

### With Backend (AI Features)

```bash
# Terminal 1: Backend
cd backend
uvicorn api:app --reload --port 8000

# Terminal 2: Frontend  
cd frontend
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## File Structure Reference

```
DatesDraft/
├── backend/
│   ├── api.py              # FastAPI endpoints (AI only)
│   ├── ai_bestie.py        # AI Bestie agent
│   ├── oboarding_agent.py  # Onboarding agent
│   └── simulation/         # Simulation logic
├── frontend/
│   ├── docs/               # PROJECT STANDARDS (follow these!)
│   ├── src/
│   │   ├── app/
│   │   │   └── routes/     # Page components
│   │   ├── components/     # Shared UI components
│   │   ├── features/
│   │   │   ├── profiles/   # Profile data (existing)
│   │   │   ├── swiping/    # Swipes & matches (new)
│   │   │   ├── chat/       # Chat messages (extend)
│   │   │   ├── onboarding/ # Onboarding AI (new)
│   │   │   ├── bestie/     # AI Bestie (new)
│   │   │   └── simulation/ # Date simulation (new)
│   │   ├── hooks/          # Shared hooks
│   │   ├── lib/
│   │   │   ├── api-client.ts   # Backend API client
│   │   │   ├── storage.ts      # localStorage utilities
│   │   │   └── utils.ts
│   │   └── stores/         # Global state (Zustand)
│   └── public/
│       └── profiles/       # Static profile JSON files
├── profiles/               # Source profile data
└── Prompts/                # AI prompt templates
```

---

## Notes

- **localStorage limit**: ~5-10MB per domain, more than enough for POC
- **No persistence across devices**: localStorage is browser-specific
- **Clear data**: Call `clearAllData()` from `storage.ts` or `localStorage.clear()` in console
- **Current user**: Set via login page selection (no auth, just pick a profile)
- **React Query DevTools**: Enable in dev for debugging cache state
