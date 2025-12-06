# Profiles Feature

This feature handles loading, transforming, and serving user profile data across the application.

## Overview

Profile data is sourced from static JSON files in `/public/profiles/` and transformed into different formats for different UI contexts (dashboard, chat, swiping).

## Directory Structure

```
profiles/
├── api/
│   ├── get-profiles.ts       # React Query hooks for fetching profiles
│   └── get-profiles.test.ts  # Tests for profile fetchers
├── types/
│   ├── profile-schema.ts     # Zod schema for validating raw profile JSON
│   ├── ui-profile.ts         # UI-friendly profile type and transformer
│   └── swipe-profile.ts      # Swiping-specific profile type and transformer
└── README.md                 # This file
```

## Data Flow

1. **Source Data**: JSON files in `/public/profiles/` (copied from `/profiles/`)
   - `index.json` - Manifest listing all available profiles
   - `marvin.json`, `john.json`, `ling.json`, `sarah.json` - Individual profile data

2. **Schema Validation**: Raw JSON is validated against `FullProfileSchema` (Zod)

3. **Transformation**: Full profiles are transformed to context-specific types:
   - `UIProfile` - For dashboard and chat views (compact, display-oriented)
   - `SwipeProfile` - For swiping interface (extended fields for card UI)

4. **React Query Hooks**: Components consume data via hooks that handle loading, caching, and error states

## Usage

### Dashboard / Match Listing

```typescript
import { useProfiles } from "@/features/profiles/api/get-profiles";

function Dashboard() {
  const { data: profiles, isLoading, error } = useProfiles();
  // profiles is UIProfile[]
}
```

### Chat / Profile Detail

```typescript
import { useUIProfile } from "@/features/profiles/api/get-profiles";

function Chat() {
  const { id } = useParams();
  const { data: profile, isLoading } = useUIProfile(id);
  // profile is UIProfile
}
```

### Swiping

```typescript
import { useSwipeProfiles } from "@/features/profiles/api/get-profiles";

function Swiping() {
  const { data: profiles, isLoading } = useSwipeProfiles();
  // profiles is SwipeProfile[]
}
```

### Full Profile Access

```typescript
import { useFullProfile } from "@/features/profiles/api/get-profiles";

function ProfileSettings() {
  const { data: profile } = useFullProfile("marvin");
  // profile is FullProfile (complete raw data)
}
```

## Adding New Profiles

1. Create a new JSON file in `/profiles/` (e.g., `alex.json`)
2. Follow the structure defined in `FullProfileSchema`
3. Copy the file to `/frontend/public/profiles/`
4. Update `/frontend/public/profiles/index.json` to include the new profile:
   ```json
   {
     "profiles": [
       ...
       { "id": "alex", "filename": "alex.json" }
     ]
   }
   ```

## Type Reference

### FullProfile
Complete profile structure from source JSON. Includes:
- `profile` - Basic info (name, age, gender, location, etc.)
- `relationship` - Intent, pace to meet
- `lifestyle` - Social energy, weekend activities, travel style, pets, etc.
- `values` - Family closeness, money mindset, faith, political engagement, etc.
- `communication` - Conflict style, texting cadence, love languages
- `empathy_accountability` - Past relationship reflections, accountability style
- `dealbreakers` - Array of dealbreaker strings
- `must_haves` - Array of must-have strings
- `agent_persona` - AI chatbot personality configuration
- `AI_summary` - Generated summary text

### UIProfile
Simplified profile for UI display:
- `id`, `name`, `age`, `occupation`, `location`, `avatar`, `tags`, `compatibilityScore?`

### SwipeProfile
Extended profile for swiping cards:
- All UIProfile fields plus: `pronouns`, `job`, `education`, `distance`, `photo`, `shared`, `friction`, `prompt`, `vibe`

## Testing

Run tests:
```bash
npm test src/features/profiles
```

Tests cover:
- Fetching and transforming profiles
- Error handling
- Schema validation
- Individual profile queries

