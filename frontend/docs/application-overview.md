# 💻 Application Overview

DatesDraft is an AI-powered dating application that helps users find meaningful connections through intelligent matching, simulated compatibility analysis, and personalized chat interactions.

Users complete an onboarding questionnaire that captures their preferences, values, and personality. They can then browse potential matches, run AI-powered compatibility simulations, swipe through profiles, and chat with matches.

## Data model

The application contains the following models:

### Profile

User profiles are stored as JSON files in `/public/profiles/` (sourced from `/profiles/` in the project root). Each profile includes:

- **Basic Info**: name, age, gender, pronouns, location, height, orientation
- **Relationship**: intent (casual/long-term), pace to meet
- **Lifestyle**: social energy, weekend activities, travel style, work-life balance, pets
- **Values**: family closeness, money mindset, openness to kids, faith importance, political engagement
- **Communication**: conflict style, texting cadence, love languages
- **Accountability**: past relationship reflections, red flags
- **Preferences**: dealbreakers, must-haves
- **AI Persona**: chatbot configuration for personalized interactions

Profiles are fetched via React Query hooks and transformed into different formats:
- `UIProfile` - For dashboard/chat (compact view)
- `SwipeProfile` - For swiping interface (extended card details)
- `FullProfile` - Complete raw data from JSON

### Match

Represents a compatibility match between users, including:
- Profile data reference
- Compatibility score (computed or simulated)
- Match status (idle/simulating/completed)

### Message

Chat messages between matched users with AI-assisted suggestions.

## Get Started

To get started with development:

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. View the app at `http://localhost:5173`

### Key Routes

- `/` - Landing page
- `/login` - Authentication
- `/questionnaire` - Onboarding questionnaire
- `/dashboard` - Browse and manage matches
- `/swiping` - Swipe through profiles
- `/chat/:id` - Chat with a specific match

### Profile Data

Profile data is loaded from `/public/profiles/`. To add or modify profiles, edit the JSON files in the root `/profiles/` directory and copy them to `/frontend/public/profiles/`. See `/frontend/src/features/profiles/README.md` for details.
