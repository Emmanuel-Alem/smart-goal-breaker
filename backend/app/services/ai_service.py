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


def simplify_error_message(error: Exception) -> str:
    """Convert technical error messages to user-friendly messages.
    
    Handles all official Gemini API error codes based on Google documentation:
    - 404 NOT_FOUND: Resource/model not found
    - 429 RESOURCE_EXHAUSTED: Quota or rate limit exceeded
    - 400 INVALID_ARGUMENT/FAILED_PRECONDITION: Bad request
    - 403 PERMISSION_DENIED: API key lacks permissions
    - 500 INTERNAL: Server error
    - 503 UNAVAILABLE: Service overloaded
    """
    error_str = str(error)
    error_lower = error_str.lower()
    
    # === HTTP 404 - NOT_FOUND ===
    if "404" in error_str:
        if any(kw in error_lower for kw in ["not found", "is not found", "not supported"]):
            return "The selected AI model is not available. Please try a different model from the settings."
        return "Requested resource not found. Please check your request."
    
    # === HTTP 429 - RESOURCE_EXHAUSTED ===
    if "429" in error_str:
        # Subcase A: Quota exhausted (free tier limit reached)
        if "limit: 0" in error_lower or "quota exceeded" in error_lower:
            return "API quota exceeded. Your free tier limit has been reached. Try again tomorrow or upgrade your plan."
        # Subcase B: Rate limit (too many requests per minute)
        if any(kw in error_lower for kw in ["resource exhausted", "too many requests", "rate limit"]):
            return "Too many requests. Please wait a few seconds and try again."
        # Generic 429
        return "API rate limit reached. Please wait a moment and try again."
    
    # === HTTP 400 - BAD REQUEST ===
    if "400" in error_str:
        if "failed_precondition" in error_lower or "free tier unavailable" in error_lower:
            return "API not available in your region. Enable billing to continue."
        if "invalid_argument" in error_lower:
            return "Invalid request format. Please try again."
        return "Bad request. Please check your input."
    
    # === HTTP 403 - PERMISSION_DENIED ===
    if "403" in error_str or "permission_denied" in error_lower:
        return "API key doesn't have permission. Please check your API key."
    
    # === HTTP 500 - INTERNAL ERROR ===
    if "500" in error_str or ("internal" in error_lower and "error" in error_lower):
        return "Server error occurred. Please try again in a moment."
    
    # === HTTP 503 - SERVICE UNAVAILABLE ===
    if "503" in error_str or "unavailable" in error_lower:
        return "Service temporarily unavailable. Please try again later."
    
    # === GENERIC PATTERNS (fallback for non-HTTP errors) ===
    
    # API key errors (not caught by 403)
    if any(kw in error_lower for kw in ["api key", "api_key_invalid", "api key not found"]):
        return "Invalid or missing API key. Please check your configuration."
    
    # Network errors
    if any(kw in error_lower for kw in ["connection", "timeout", "network"]):
        return "Network error. Please check your connection and try again."
    
    # Truncate long messages
    if len(error_str) > 200:
        return error_str[:197] + "..."
    
    return error_str


AVAILABLE_MODELS = [
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Fast, latest stable"},
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "Newest, experimental"},
    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "description": "Previous gen, stable"},
    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "description": "Higher quality, slower"},
]

DEFAULT_MODEL = "gemini-2.5-flash"


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
            if any(keyword in error_str for keyword in ["quota", "rate limit", "429", "404", "resource exhausted", "api key"]):
                # Don't retry on quota errors, use simplified message
                friendly_message = simplify_error_message(e)
                raise RateLimitExceededError(friendly_message)
            
            if attempt < max_retries - 1:
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
    
    raise last_error
