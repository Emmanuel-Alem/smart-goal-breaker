import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str
    GEMINI_API_KEY: str
    FRONTEND_URL: str
    
    def __init__(self):
        self.DATABASE_URL = os.getenv(
            "DATABASE_URL", 
            "postgresql+asyncpg://postgres:postgres@localhost:5432/goalbreaker"
        )
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        self._validate()
    
    def _validate(self):
        errors = []
        
        if not self.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is required")
        
        if not self.DATABASE_URL:
            errors.append("DATABASE_URL is required")
        
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
