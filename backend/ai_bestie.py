"""
AIBestie module: a supportive "bestie" agent that chats with the user after dates/chats,
offers suggestions, and updates their profile JSON for better future matching.

Usage as a module:
    from ai_bestie import AIBestie
    bestie = AIBestie(profile_path="profiles/john.json")
    opening = bestie.start()               # greeting that knows the existing profile
    reply = bestie.send("Had a good date") # conversational turn
    text, parsed = bestie.summarize_and_update()  # get JSON update
    bestie.save_profile(parsed)            # writes back to profile_path

CLI (interactive demo):
    python backend/ai_bestie.py --profile profiles/john.json --prompt ./Prompts/aiBestiePrompt.yaml --model gemini-2.5-flash
    Type your messages. Enter 'done' to save updated profile, or 'exit' to quit without saving.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional, Tuple

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


def strip_fence(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        # remove leading ```
        t = t.split("```", 2)[1] if "```" in t else t
        # drop optional language hint
        t = t.lstrip().lstrip("json").lstrip()
        # remove trailing fence
        if "```" in t:
            t = t.split("```", 1)[0]
    return t.strip()


class AIBestie:
    def __init__(
        self,
        profile_path: str = "profiles/john.json",
        prompt_path: str = "./Prompts/aiBestiePrompt.yaml",
        model_name: str = "gemini-2.5-flash",
        api_key: Optional[str] = None,
        env_path: Optional[str] = None,
    ) -> None:
        repo_root = Path(__file__).resolve().parent.parent
        dotenv_path = env_path or repo_root / ".env"
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

        self.profile_path = repo_root / profile_path
        self.profile = self._load_profile()

    def _load_profile(self) -> dict:
        if not self.profile_path.exists():
            raise FileNotFoundError(f"Profile not found at {self.profile_path}. Bestie only updates existing profiles.")
        with open(self.profile_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def start(self) -> str:
        """Send initial greeting using current profile context."""
        context = json.dumps(self.profile, indent=2) if self.profile else "{}"
        msg = (
            "Here is the current user profile as context:\n"
            f"```json\n{context}\n```\n"
            "Greet the user as their supportive bestie and ask how the chat/date went."
        )
        return self.send(msg)

    def send(self, user_text: str, structured: bool = False) -> str:
        gen_cfg = self.json_generation_config if structured else None
        resp = self.chat.send_message(user_text, generation_config=gen_cfg)
        return resp.text.strip() if hasattr(resp, "text") else str(resp)

    def summarize_and_update(self) -> Tuple[str, Optional[dict]]:
        """Ask the model for the updated profile JSON and parse it."""
        resp = self.chat.send_message(
            "Please generate the updated report JSON now.",
            generation_config=self.json_generation_config,
        )
        raw = resp.text.strip() if hasattr(resp, "text") else str(resp)
        parsed = self._parse_json(raw)
        return raw, parsed

    def _parse_json(self, raw: str) -> Optional[dict]:
        payload = strip_fence(raw)
        try:
            return json.loads(payload)
        except Exception:
            return None

    def _merge_profiles(self, base: dict, incoming: dict) -> dict:
        """Deep-merge incoming into base; lists/values overwrite when provided."""
        if not isinstance(base, dict) or not isinstance(incoming, dict):
            return incoming if incoming is not None else base
        merged = dict(base)
        for k, v in incoming.items():
            if k in merged and isinstance(merged[k], dict) and isinstance(v, dict):
                merged[k] = self._merge_profiles(merged[k], v)
            else:
                merged[k] = v if v is not None else merged.get(k)
        return merged

    def save_profile(self, parsed: Optional[dict]) -> Optional[Path]:
        if not parsed:
            return None
        incoming = parsed.get("updated_profile") or parsed
        merged = self._merge_profiles(self.profile, incoming)
        with open(self.profile_path, "w", encoding="utf-8") as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)
        return self.profile_path


def _cli():
    parser = argparse.ArgumentParser(description="Run AI Bestie in the terminal.")
    parser.add_argument(
        "--profile",
        default="profiles/john.json",
        help="Path to user profile JSON to read/update",
    )
    parser.add_argument(
        "--prompt",
        default="./Prompts/aiBestiePrompt.yaml",
        help="Path to aiBestiePrompt.yaml",
    )
    parser.add_argument(
        "--model",
        default="gemini-2.5-flash",
        help="Gemini model name (e.g., gemini-1.5-flash, gemini-1.5-pro)",
    )
    args = parser.parse_args()

    try:
        bestie = AIBestie(
            profile_path=args.profile,
            prompt_path=args.prompt,
            model_name=args.model,
        )
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to initialize AI Bestie: {exc}\n")
        sys.exit(1)

    try:
        opening = bestie.start()
        print(f"Bestie: {opening}\n")
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"Failed to start conversation: {exc}\n")
        sys.exit(1)

    print("Type your replies. Enter 'done' to save updated profile, or 'exit' to quit without saving.\n")
    while True:
        user_msg = input("You: ").strip()
        if user_msg.lower() in {"exit", "quit"}:
            print("Exiting without saving.")
            break
        if user_msg.lower() in {"done", "save", "finish"}:
            try:
                raw, parsed = bestie.summarize_and_update()
                print(f"\nBestie (JSON):\n{raw}\n")
                path = bestie.save_profile(parsed)
                if path:
                    print(f"Saved updated profile to {path}")
            except Exception as exc:  # noqa: BLE001
                sys.stderr.write(f"Failed to summarize/save: {exc}\n")
            break

        try:
            reply = bestie.send(user_msg)
            print(f"\nBestie: {reply}\n")
        except Exception as exc:  # noqa: BLE001
            sys.stderr.write(f"Model error: {exc}\n")
            break


if __name__ == "__main__":
    _cli()

