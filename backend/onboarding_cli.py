"""
Simple terminal runner for the onboarding agent prompt using Gemini.

Prereqs:
- pip install -r backend/requirements.txt
- create .env at repo root with GEMINI_API_KEY=your_key

Usage:
  python backend/onboarding_cli.py
  python backend/onboarding_cli.py --prompt ./Prompts/onboardingPrompt.yaml --model gemini-1.5-pro
"""

import argparse
import os
import sys
import textwrap

import google.generativeai as genai
import yaml
from dotenv import load_dotenv


def load_prompt(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    prompt = data.get("agent_system_prompt")
    if not prompt:
        raise ValueError("agent_system_prompt not found in YAML")
    return prompt


def init_model(api_key: str, model_name: str, system_prompt: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_prompt,
    )


def main():
    # Load environment from repo root .env if present.
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    dotenv_path = os.path.join(repo_root, ".env")
    load_dotenv(dotenv_path)

    parser = argparse.ArgumentParser(description="Run onboarding agent in the terminal.")
    parser.add_argument(
        "--prompt",
        default="./Prompts/onboardingPrompt.yaml",
        help="Path to onboardingPrompt.yaml",
    )
    parser.add_argument(
        "--model",
        default="gemini-2.5-flash",
        help="Gemini model name (e.g., gemini-1.5-flash, gemini-1.5-pro)",
    )
    args = parser.parse_args()

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        sys.stderr.write("GEMINI_API_KEY is required in the environment.\n")
        sys.exit(1)

    try:
        system_prompt = load_prompt(args.prompt)
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to load prompt: {exc}\n")
        sys.exit(1)

    try:
        model = init_model(api_key, args.model, system_prompt)
        chat = model.start_chat()
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to initialize Gemini model: {exc}\n")
        sys.exit(1)

    # Kick off the conversation so the agent uses its opening.
    try:
        first = chat.send_message("Start the onboarding conversation.")
        print(f"Agent: {first.text.strip()}\n")
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to get initial response: {exc}\n")
        sys.exit(1)

    print("Type your replies. Enter 'exit' to quit.\n")
    while True:
        user_msg = input("You: ").strip()
        if user_msg.lower() in {"exit", "quit"}:
            print("Exiting.")
            break
        try:
            resp = chat.send_message(user_msg)
        except Exception as exc:  # noqa: BLE001
            sys.stderr.write(f"Model error: {exc}\n")
            break

        text = resp.text.strip() if hasattr(resp, "text") else str(resp)
        print(f"\nAgent: {text}\n")

        if "Thank you, your dates are on the way." in text:
            # Agent should follow with the JSON report per the system prompt.
            continue


if __name__ == "__main__":
    main()

