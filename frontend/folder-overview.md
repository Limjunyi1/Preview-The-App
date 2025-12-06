# Folder Overview (Frontend `src/`)

Quick guide to what each top-level folder in `src/` is responsible for, aligned with the project structure and unidirectional flow (shared → features → app).

- `app/`
  - `app.tsx`: application shell; sets providers (React Query, tooltips, toasters) and mounts the router.
  - `routes/`: all route-level screens (`/`, `/login`, `/questionnaire`, `/dashboard`, `/swiping`, `/chat/:id`, `*`).
  - **Imports:** may consume `features/*` and shared modules.

- `components/`
  - Shared, truly app-wide presentational pieces (e.g., `brand-logo`, `nav-link`).
  - **Imports:** should not depend on features or app routes; only shared utilities/hooks.

- `features/`
  - Domain-scoped code organized per feature. Each feature can own components, constants, types, API hooks, and mocks.
  - Current features:
    - `auth/` → `components/login-form.tsx`
    - `questionnaire/` → `components/chat-interface.tsx`, `constants/categories.ts`
    - `matching/` → `components/match-card.tsx`, `components/simulation-report.tsx`, `types/match.ts`
    - `chat/` → `types/profile.ts`
    - `profiles/` → `api/get-profiles.ts`, `types/profile-schema.ts`, `types/ui-profile.ts`, `types/swipe-profile.ts` (loads real profile data from `/public/profiles/`)
  - **Imports:** may use shared modules; avoid cross-feature imports unless explicitly shared.

- `hooks/`
  - Shared reusable hooks (`use-mobile`, `use-toast`) available to features and app.

- `lib/`
  - Shared libraries/helpers (`api-client`, `utils`). Holds cross-cutting infra like API client setup.

- `constants/`
  - Reserved for shared/global constants (currently empty; feature-specific constants live inside their feature).

- `pages/`
  - Legacy/empty placeholder after refactor; routes now live in `app/routes/`.

- Root files
  - `main.tsx`: entrypoint mounting `<App />`.
  - `index.css`, `App.css`: global styles and theme variables.

Unidirectional import reminder:
- Shared (`components/`, `hooks/`, `lib/`, `constants/`) → can be imported by features and app.
- Features → imported by `app/` routes; avoid importing one feature directly into another unless explicitly shared via a shared module.

