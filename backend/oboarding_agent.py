"""
Onboarding agent module for reuse in the app.

Usage as a module:
    from oboarding_agent import OnboardingAgent
    agent = OnboardingAgent()
    first = agent.start()                     # agent opening (text)
    reply = agent.send("My answer")           # conversational text
    final = agent.send("Please output the JSON report now.", structured=True)

CLI (fallback):
    python backend/oboarding_agent.py --prompt ./Prompts/onboardingPrompt.yaml --model gemini-2.5-flash
"""

import argparse
import os
import sys
from typing import Optional

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


class OnboardingAgent:
    def __init__(
        self,
        prompt_path: str = "./Prompts/onboardingPrompt.yaml",
        model_name: str = "gemini-2.5-flash",
        api_key: Optional[str] = None,
        env_path: Optional[str] = None,
    ) -> None:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        dotenv_path = env_path or os.path.join(repo_root, ".env")
        load_dotenv(dotenv_path)

        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY is required in environment or passed in.")

        self.model_name = model_name
        self.system_prompt = load_prompt(prompt_path)

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=self.system_prompt,
        )
        self.json_generation_config = {"response_mime_type": "application/json"}
        self.chat = self.model.start_chat()

    def start(self) -> str:
        """Send the initial kickoff message and return agent text."""
        resp = self.chat.send_message("Start the onboarding conversation.")
        return resp.text.strip() if hasattr(resp, "text") else str(resp)

    def send(self, user_text: str, structured: bool = False) -> str:
        """Send a user message and return agent text (or structured JSON if structured=True)."""
        gen_cfg = self.json_generation_config if structured else None
        resp = self.chat.send_message(user_text, generation_config=gen_cfg)
        return resp.text.strip() if hasattr(resp, "text") else str(resp)

    def get_report(self) -> str:
        """Request the structured JSON report."""
        resp = self.chat.send_message(
            "Generate the JSON report now.",
            generation_config=self.json_generation_config,
        )
        return resp.text.strip() if hasattr(resp, "text") else str(resp)


def _cli():
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

    try:
        agent = OnboardingAgent(prompt_path=args.prompt, model_name=args.model)
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to initialize agent: {exc}\n")
        sys.exit(1)

    try:
        opening = agent.start()
        print(f"Agent: {opening}\n")
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to start conversation: {exc}\n")
        sys.exit(1)

    print("Type your replies. Enter 'exit' to quit.\n")
    while True:
        user_msg = input("You: ").strip()
        if user_msg.lower() in {"exit", "quit"}:
            print("Exiting.")
            break
        try:
            text = agent.send(user_msg)
            print(f"\nAgent: {text}\n")
        except Exception as exc:  # noqa: BLE001
            sys.stderr.write(f"Model error: {exc}\n")
            break

        # Auto-request structured JSON when the agent signals closing but hasn't emitted JSON.
        closing_phrase = "Thank you, your dates are on the way."
        has_json = "```json" in text or text.strip().startswith("{")
        if closing_phrase in text and not has_json:
            try:
                json_report = agent.get_report()
                print(f"Agent (JSON):\n{json_report}\n")
            except Exception as exc:  # noqa: BLE001
                sys.stderr.write(f"Failed to get JSON report: {exc}\n")
                break


if __name__ == "__main__":
    _cli()

