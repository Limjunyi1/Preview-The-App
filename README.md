<h1 align="center">
  Preview
</h1>

<p align="center">
  <i align="center">Know Before You Say Hello 🚀</i>
</p>

<p align="center">
  <b>The Dating App Where You Know Before You Say Hello</b>
</p>

---

## Introduction

**Preview** is a next-generation dating app designed to end "talking stage fatigue." Unlike traditional swiping apps, Preview lets you simulate a first date before you even say hello.

Using advanced AI agents that embody your authentic self, Preview runs deep compatibility simulations to find your best matches. Our "Magic Mirror" technology and "AI Bestie" ensure you put your best foot forward while staying true to who you are.

**Stop swiping blindly. Start Previewing.**

## Features

<details open>
<summary><b>🤖 AI-Powered Compatibility Simulation</b></summary>
<br>
Skip the awkward small talk. Our AI agents, trained on your deep profile, role-play a first date with potential matches. 

- **Simulation Report**: Get a "Trailer" of your potential relationship.
- **Highs & Lows**: Identify shared passions and potential friction points instantly.
- **Vibe Check**: Quantifiable compatibility score based on conversation flow.
</details>

<details open>
<summary><b>🗣️ Interactive Onboarding Agent</b></summary>
<br>
Forget boring forms. Chat with our Onboarding Agent to build your profile. It asks the right questions to understand your values, humor, and lifestyle, creating a persona that actually sounds like you.
</details>

<details open>
<summary><b>👯 AI Bestie</b></summary>
<br>
Your personal dating coach. The AI Bestie helps you:
- Refine your profile.
- Analyze simulation results.
- meaningful icebreakers based on simulation insights.
</details>

<details>
<summary><b>🔮 Magic Mirror (Voice Cloning)</b></summary>
<br>
<i>Experimental Feature</i>: Uses Coqui TTS to clone your voice, allowing for hyper-realistic audio simulations and voice interactions.
</details>

<details>
<summary><b>❤️ Smart Matching Algorithms</b></summary>
<br>
We use proven economic algorithms like <b>Deferred Acceptance (Gale-Shapley)</b> and <b>Top Trading Cycle</b> to ensure optimal matching efficiency, moving beyond simple distance/age filters.
</details>

## Tech Stack

### Backend
- **Framework**: Python, FastAPI
- **AI Models**: Google Gemini (Simulation & Chat), OpenAI (Transcription)
- **Voice**: Coqui TTS (XTTS v2), SoundDevice
- **Algorithms**: Deferred Acceptance, Top Trading Cycle

### Frontend
- **Framework**: React, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- API Keys:
  - `GEMINI_API_KEY` (for Simulation/Chat)
  - `OPENAI_API_KEY` (for Transcription)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/preview.git
   cd preview
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   
   # Install dependencies
   pip install -r requirements.txt # (Ensure you generate this if missing)
   # Or install manually based on imports:
   # pip install fastapi uvicorn google-generativeai openai sounddevice soundfile pydantic
   
   # Run the server
   python api.py
   ```
   Server runs at `http://localhost:8000`.

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App runs at `http://localhost:5173`.

## Project Structure

```
├── backend/
│   ├── api.py                 # Main FastAPI entrypoint
│   ├── ai_bestie.py          # AI Bestie logic
│   ├── oboarding_agent.py    # Onboarding chat logic
│   ├── simulation/           # Simulation engine (Gemini)
│   ├── magic_mirror/         # Voice cloning (TTS)
│   └── vibe_check/           # Matching algorithms
├── frontend/
│   ├── src/
│   │   ├── app/routes/       # Pages (Dashboard, Chat, etc.)
│   │   ├── features/         # Feature-based modules
│   │   └── components/       # UI Components
├── profiles/                 # User JSON profiles
└── Prompts/                  # AI System Prompts
```

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

