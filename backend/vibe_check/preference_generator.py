# backend/vibe_check/preference_generator.py
"""
AI-powered preference ranking for stable matching.

Dynamically loads profiles and uses LLM to generate ranked compatibility
preferences for the Gale-Shapley algorithm.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set

import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Config
REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PROFILE_DIR = REPO_ROOT / "profiles"
DEFAULT_MODEL = os.getenv("MODEL_NAME", "gemini-2.5-flash")

# ==============================================================================
# STATIC PROFILE IDS (seed profiles that always exist)
# ==============================================================================
STATIC_MEN: Set[str] = {"aaron", "daniel", "john", "ling", "marcus", "marvin"}
STATIC_WOMEN: Set[str] = {"elena", "emma", "maya", "olivia", "priya", "sarah", "sofia"}
STATIC_PROFILES: Set[str] = STATIC_MEN | STATIC_WOMEN

# ==============================================================================
# HARDCODED PREFERENCES FOR STATIC PROFILES
# These are pre-computed rankings to avoid AI calls for seed users
# ==============================================================================

# Men's preferences (ranked list of women they prefer, most preferred first)
STATIC_MEN_PREFS: Dict[str, List[str]] = {
    "marvin": ["sarah", "emma", "elena", "maya", "priya", "olivia", "sofia"],
    "ling": ["emma", "sarah", "maya", "elena", "sofia", "olivia", "priya"],
    "john": ["sarah", "maya", "emma", "olivia", "priya", "elena", "sofia"],
    "marcus": ["elena", "priya", "sofia", "emma", "sarah", "maya", "olivia"],
    "daniel": ["olivia", "maya", "sarah", "emma", "elena", "priya", "sofia"],
    "aaron": ["priya", "sofia", "elena", "olivia", "maya", "emma", "sarah"],
}

# Women's preferences (ranked list of men they prefer, most preferred first)
STATIC_WOMEN_PREFS: Dict[str, List[str]] = {
    "sarah": ["marvin", "john", "ling", "daniel", "marcus", "aaron"],
    "emma": ["ling", "marvin", "daniel", "john", "aaron", "marcus"],
    "elena": ["marcus", "aaron", "marvin", "ling", "daniel", "john"],
    "maya": ["daniel", "john", "ling", "marvin", "aaron", "marcus"],
    "priya": ["aaron", "marcus", "daniel", "john", "marvin", "ling"],
    "olivia": ["daniel", "john", "marcus", "aaron", "ling", "marvin"],
    "sofia": ["marcus", "aaron", "ling", "marvin", "daniel", "john"],
}

# ==============================================================================
# AI RANKING PROMPT (only used for new users)
# ==============================================================================
RANKING_PROMPT_TEMPLATE = """You are a dating compatibility analyst. Given a user's profile and a list of potential matches, rank the matches by compatibility.

## User Profile (looking for matches):
{user_profile}

## Potential Matches to Rank:
{candidates}

## Instructions:
1. Consider orientation compatibility (MUST be compatible to be ranked)
2. Evaluate relationship intent alignment (casual vs long-term)
3. Assess values alignment (family, faith, money mindset)
4. Check for dealbreaker conflicts
5. Consider communication style and lifestyle compatibility
6. Factor in social energy compatibility (introvert/extrovert)

Return ONLY a JSON array of profile IDs in order of compatibility (most compatible first).
Only include profiles that are orientation-compatible with the user.
If no profiles are compatible, return an empty array.

Example output format:
["sarah", "emma", "maya"]

Output:"""


# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

def _strip_json_fence(text: str) -> str:
    """Remove markdown code fences if present."""
    text = text.strip()
    fence_pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(fence_pattern, text, flags=re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return text


def load_all_profiles(profile_dir: Optional[Path] = None) -> Dict[str, dict]:
    """Load all profile JSON files from the profiles directory."""
    profile_dir = profile_dir or DEFAULT_PROFILE_DIR
    profiles = {}
    
    if not profile_dir.exists():
        return profiles
    
    for file_path in profile_dir.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                profile_data = json.load(f)
                profile_id = file_path.stem  # filename without extension
                profiles[profile_id] = profile_data
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load profile {file_path}: {e}")
            continue
    
    return profiles


def load_profile(profile_id: str, profile_dir: Optional[Path] = None) -> Optional[dict]:
    """Load a single profile by ID."""
    profile_dir = profile_dir or DEFAULT_PROFILE_DIR
    file_path = profile_dir / f"{profile_id}.json"
    
    if not file_path.exists():
        return None
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


def _get_gender(profile: dict) -> str:
    """Extract normalized gender from profile."""
    gender = profile.get("profile", {}).get("gender", "").lower()
    if gender in ["male", "man", "m"]:
        return "male"
    elif gender in ["female", "woman", "f"]:
        return "female"
    return gender


def _get_orientation(profile: dict) -> str:
    """Extract orientation from profile."""
    return profile.get("profile", {}).get("orientation", "").lower()


def _is_seeking_gender(orientation: str, target_gender: str) -> bool:
    """Check if an orientation is seeking a particular gender."""
    orientation = orientation.lower()
    if target_gender == "male":
        return any(term in orientation for term in ["men", "man", "male", "straight", "bisexual", "any"])
    elif target_gender == "female":
        return any(term in orientation for term in ["women", "woman", "female", "straight", "bisexual", "any"])
    return True  # Default to compatible if uncertain


def _format_profile_for_prompt(profile_id: str, profile: dict) -> str:
    """Format a single profile for inclusion in the LLM prompt."""
    p = profile.get("profile", {})
    display_name = p.get("display_name", profile_id)
    age = p.get("age", "?")
    location = p.get("location", "Unknown")
    orientation = p.get("orientation", "Not specified")
    
    relationship = profile.get("relationship", {})
    intent = relationship.get("intent", "Not specified")
    
    lifestyle = profile.get("lifestyle", {})
    social_energy = lifestyle.get("social_energy", "Not specified")
    
    values = profile.get("values", {})
    
    dealbreakers = profile.get("dealbreakers", [])
    must_haves = profile.get("must_haves", [])
    
    ai_summary = profile.get("AI_summary", profile.get("ai_summary", ""))
    
    return f"""
ID: {profile_id}
Name: {display_name}, Age: {age}, Location: {location}
Orientation: {orientation}
Relationship Intent: {intent}
Social Energy: {social_energy}
Values: {json.dumps(values, indent=2)}
Dealbreakers: {dealbreakers}
Must-haves: {must_haves}
Summary: {ai_summary}
"""


def is_new_user(user_id: str) -> bool:
    """Check if a user ID is a new user (not in static profiles)."""
    return user_id not in STATIC_PROFILES


# ==============================================================================
# AI RANKING (only for new users)
# ==============================================================================

def _rank_preferences_with_ai(
    user_id: str,
    user_profile: dict,
    candidates: Dict[str, dict],
    api_key: str,
    model_name: str = DEFAULT_MODEL,
) -> List[str]:
    """Use AI to rank candidate profiles by compatibility for a user."""
    if not candidates:
        return []
    
    # Format user profile
    user_formatted = _format_profile_for_prompt(user_id, user_profile)
    
    # Format candidates
    candidates_formatted = "\n---\n".join(
        _format_profile_for_prompt(cid, cprofile)
        for cid, cprofile in candidates.items()
    )
    
    prompt = RANKING_PROMPT_TEMPLATE.format(
        user_profile=user_formatted,
        candidates=candidates_formatted,
    )
    
    # Call Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name=model_name)
    
    try:
        response = model.generate_content(prompt)
        raw_text = getattr(response, "text", "") or ""
        cleaned = _strip_json_fence(raw_text)
        
        # Parse the JSON array
        ranked_ids = json.loads(cleaned)
        
        # Validate that all IDs are in the candidates
        valid_ids = [pid for pid in ranked_ids if pid in candidates]
        
        # Add any missing candidates at the end (in case AI missed some)
        for cid in candidates:
            if cid not in valid_ids:
                valid_ids.append(cid)
        
        return valid_ids
        
    except (json.JSONDecodeError, Exception) as e:
        print(f"Warning: AI ranking failed for {user_id}: {e}")
        # Fallback: return candidates in arbitrary order
        return list(candidates.keys())


# ==============================================================================
# HYBRID PREFERENCE GENERATION
# ==============================================================================

def generate_hybrid_preferences(
    current_user_id: str,
    user_preferences: Optional[List[str]] = None,
    profile_dir: Optional[Path] = None,
    api_key: Optional[str] = None,
    model_name: str = DEFAULT_MODEL,
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """
    Generate preference rankings using hybrid approach.
    
    - Static profiles: Use hardcoded preferences
    - New user: Use provided swipe preferences (or fallback to AI)
    
    Args:
        current_user_id: The ID of the current logged-in user
        user_preferences: Optional ordered list of preferred profile IDs from user's right swipes
        profile_dir: Directory containing profile JSON files
        api_key: Gemini API key (only needed if no user_preferences for new user)
        model_name: LLM model to use (only if using AI fallback)
    
    Returns:
        Tuple of (proposer_preferences, receiver_preferences)
    """
    # Start with copies of hardcoded preferences
    men_prefs = {k: list(v) for k, v in STATIC_MEN_PREFS.items()}
    women_prefs = {k: list(v) for k, v in STATIC_WOMEN_PREFS.items()}
    
    # Check if current user is a static profile
    if current_user_id in STATIC_PROFILES:
        # No additional preferences needed - just return hardcoded preferences
        return men_prefs, women_prefs
    
    # Load the new user's profile
    new_user_profile = load_profile(current_user_id, profile_dir)
    if not new_user_profile:
        raise RuntimeError(f"Could not load profile for user: {current_user_id}")
    
    # Determine new user's gender and which group they belong to
    new_user_gender = _get_gender(new_user_profile)
    new_user_orientation = _get_orientation(new_user_profile)
    
    # If user_preferences provided, use them directly; otherwise require API key for AI fallback
    if not user_preferences:
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Return empty preferences for new user if no swipes and no API key
            print(f"Warning: No preferences provided for user {current_user_id} and no API key for fallback")
            return men_prefs, women_prefs
        
        # Load static profiles for AI ranking fallback
        all_profiles = load_all_profiles(profile_dir)
    
    if new_user_gender == "male" and _is_seeking_gender(new_user_orientation, "female"):
        # New user is a man seeking women
        if user_preferences:
            # Use provided swipe preferences directly
            men_prefs[current_user_id] = user_preferences
        else:
            # Fallback to AI ranking
            all_profiles = load_all_profiles(profile_dir)
            static_women_profiles = {uid: all_profiles[uid] for uid in STATIC_WOMEN if uid in all_profiles}
            new_user_ranking = _rank_preferences_with_ai(
                current_user_id, new_user_profile, static_women_profiles, api_key, model_name
            )
            men_prefs[current_user_id] = new_user_ranking
        
        # Insert new user into each woman's preference list at middle position for fairness
        for woman_id in women_prefs:
            insert_pos = len(women_prefs[woman_id]) // 2
            women_prefs[woman_id].insert(insert_pos, current_user_id)
            
    elif new_user_gender == "female" and _is_seeking_gender(new_user_orientation, "male"):
        # New user is a woman seeking men
        if user_preferences:
            # Use provided swipe preferences directly
            women_prefs[current_user_id] = user_preferences
        else:
            # Fallback to AI ranking
            all_profiles = load_all_profiles(profile_dir)
            static_men_profiles = {uid: all_profiles[uid] for uid in STATIC_MEN if uid in all_profiles}
            new_user_ranking = _rank_preferences_with_ai(
                current_user_id, new_user_profile, static_men_profiles, api_key, model_name
            )
            women_prefs[current_user_id] = new_user_ranking
        
        # Insert new user into each man's preference list at middle position for fairness
        for man_id in men_prefs:
            insert_pos = len(men_prefs[man_id]) // 2
            men_prefs[man_id].insert(insert_pos, current_user_id)
    else:
        # User doesn't fit standard heterosexual matching - skip
        print(f"Warning: User {current_user_id} doesn't fit matching groups")
    
    return men_prefs, women_prefs


# ==============================================================================
# LEGACY/COMPAT FUNCTIONS
# ==============================================================================

def get_preference_rankings(
    current_user_id: Optional[str] = None,
    user_preferences: Optional[List[str]] = None,
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """
    Get preference rankings for stable matching.
    
    If current_user_id is provided, uses hybrid approach:
    - Static profiles: hardcoded preferences
    - New user: uses provided user_preferences (from swipes) or falls back to AI
    
    Args:
        current_user_id: The ID of the current logged-in user
        user_preferences: Optional ordered list of preferred profile IDs from user's right swipes
    
    Returns:
        Tuple of (proposer_preferences, receiver_preferences)
    """
    if current_user_id is None:
        # Return only static preferences
        return (
            {k: list(v) for k, v in STATIC_MEN_PREFS.items()},
            {k: list(v) for k, v in STATIC_WOMEN_PREFS.items()},
        )
    
    return generate_hybrid_preferences(current_user_id, user_preferences=user_preferences)


# For backwards compatibility
def generate_ai_preferences(
    profiles: Optional[Dict[str, dict]] = None,
    profile_dir: Optional[Path] = None,
    api_key: Optional[str] = None,
    model_name: str = DEFAULT_MODEL,
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    """
    DEPRECATED: Use generate_hybrid_preferences() instead.
    
    This generates AI preferences for ALL profiles (expensive).
    Kept for backwards compatibility.
    """
    print("Warning: generate_ai_preferences is deprecated. Use generate_hybrid_preferences().")
    
    api_key = api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is required")
    
    if profiles is None:
        profiles = load_all_profiles(profile_dir)
    
    if len(profiles) < 2:
        return {}, {}
    
    # Split into groups
    group_a = {pid: p for pid, p in profiles.items() 
               if _get_gender(p) == "male" and _is_seeking_gender(_get_orientation(p), "female")}
    group_b = {pid: p for pid, p in profiles.items() 
               if _get_gender(p) == "female" and _is_seeking_gender(_get_orientation(p), "male")}
    
    if not group_a or not group_b:
        return {}, {}
    
    # Generate preferences
    proposer_prefs: Dict[str, List[str]] = {}
    for user_id, user_profile in group_a.items():
        ranked = _rank_preferences_with_ai(user_id, user_profile, group_b, api_key, model_name)
        if ranked:
            proposer_prefs[user_id] = ranked
    
    receiver_prefs: Dict[str, List[str]] = {}
    for user_id, user_profile in group_b.items():
        ranked = _rank_preferences_with_ai(user_id, user_profile, group_a, api_key, model_name)
        if ranked:
            receiver_prefs[user_id] = ranked
    
    return proposer_prefs, receiver_prefs
