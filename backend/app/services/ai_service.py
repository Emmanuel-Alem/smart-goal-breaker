import google.generativeai as genai
import json
import re
import asyncio
import time
from functools import lru_cache
from collections import deque

from ..config import get_settings


class RateLimiter:
    """Simple rate limiter to prevent API quota exhaustion."""
    
    def __init__(self, max_requests_per_minute: int = 10, max_requests_per_day: int = 500):
        self.max_per_minute = max_requests_per_minute
        self.max_per_day = max_requests_per_day
        self.minute_requests: deque = deque()
        self.daily_requests: deque = deque()
    
    def _clean_old_requests(self):
        """Remove requests older than their time window."""
        now = time.time()
        
        # Clean requests older than 1 minute
        while self.minute_requests and now - self.minute_requests[0] > 60:
            self.minute_requests.popleft()
        
        # Clean requests older than 24 hours
        while self.daily_requests and now - self.daily_requests[0] > 86400:
            self.daily_requests.popleft()
    
    def can_make_request(self) -> tuple[bool, str]:
        """Check if a request can be made. Returns (allowed, error_message)."""
        self._clean_old_requests()
        
        if len(self.minute_requests) >= self.max_per_minute:
            wait_time = 60 - (time.time() - self.minute_requests[0])
            return False, f"Rate limit exceeded. Please wait {int(wait_time)} seconds."
        
        if len(self.daily_requests) >= self.max_per_day:
            return False, "Daily limit reached. Please try again tomorrow."
        
        return True, ""
    
    def record_request(self):
        """Record a successful request."""
        now = time.time()
        self.minute_requests.append(now)
        self.daily_requests.append(now)
    
    def get_usage(self) -> dict:
        """Get current usage stats."""
        self._clean_old_requests()
        return {
            "requests_this_minute": len(self.minute_requests),
            "requests_today": len(self.daily_requests),
            "max_per_minute": self.max_per_minute,
            "max_per_day": self.max_per_day,
        }


# Global rate limiter instance
rate_limiter = RateLimiter(max_requests_per_minute=10, max_requests_per_day=500)


class RateLimitExceededError(Exception):
    """Raised when rate limit is exceeded."""
    pass


AVAILABLE_MODELS = [
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Fast, latest stable"},
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "Newest, experimental"},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "description": "Previous gen, stable"},
    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "description": "Higher quality, slower"},
]

DEFAULT_MODEL = "gemini-2.0-flash"


def get_available_models() -> list:
    """Return list of available AI models."""
    return AVAILABLE_MODELS


def get_model(model_name: str = DEFAULT_MODEL):
    """Get a GenerativeModel instance for the specified model."""
    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    valid_ids = [m["id"] for m in AVAILABLE_MODELS]
    if model_name not in valid_ids:
        model_name = DEFAULT_MODEL
    
    return genai.GenerativeModel(model_name)


async def break_down_goal(goal: str, model_name: str | None = None, max_retries: int = 3) -> dict:
    # Check rate limit before making request
    can_request, error_msg = rate_limiter.can_make_request()
    if not can_request:
        raise RateLimitExceededError(error_msg)
    
    model = get_model(model_name or DEFAULT_MODEL)

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

            # Record successful request
            rate_limiter.record_request()
            
            return result
            
        except Exception as e:
            last_error = e
            
            # Check if it's a Google API quota/rate limit error
            error_str = str(e).lower()
            if any(keyword in error_str for keyword in ["quota", "rate limit", "429", "resource exhausted", "api key"]):
                # Don't retry on quota errors
                raise RateLimitExceededError(f"Google API error: {str(e)}")
            
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
    
    raise last_error
