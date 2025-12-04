import google.generativeai as genai
import json
import re
import asyncio
from functools import lru_cache

from ..config import get_settings


@lru_cache()
def get_model():
    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-2.0-flash")


async def break_down_goal(goal: str, max_retries: int = 3) -> dict:
    model = get_model()

    prompt = f"""
    You are a goal-breaking assistant. Given a vague goal, break it down into exactly 5 actionable, specific steps.
    Also provide a complexity score from 1-10 (1 = very simple, 10 = extremely complex).

    Goal: "{goal}"

    Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
    {{"complexity_score": <number 1-10>, "tasks": ["step 1", "step 2", "step 3", "step 4", "step 5"]}}
    """

    last_error = None
    
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Clean up response - remove markdown code blocks if present
            if text.startswith("```"):
                text = re.sub(r"```json?\n?", "", text)
                text = re.sub(r"```\n?", "", text)
                text = text.strip()

            result = json.loads(text)

            # Validate response structure
            if "complexity_score" not in result or "tasks" not in result:
                raise ValueError("Invalid AI response structure")

            if len(result["tasks"]) != 5:
                raise ValueError("AI must return exactly 5 tasks")

            # Ensure complexity score is in range
            result["complexity_score"] = max(1, min(10, int(result["complexity_score"])))

            return result
            
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
    
    raise last_error
