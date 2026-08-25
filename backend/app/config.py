import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Disaster Early-Warning & Resource Coordination Platform"
    PROJECT_VERSION: str = "1.0.0"
    
    # Gemini API Key & Model
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Database URL - SQLite default, easily swappable for PostgreSQL/PostGIS
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./disaster_response.db")
    
    # Default Center Coordinates (Rourkela, Odisha - Sector 6 region)
    DEFAULT_LAT: float = 22.2604
    DEFAULT_LON: float = 84.8536
    DEFAULT_DISTRICT: str = "Rourkela"
    
    # CORS Origins
    CORS_ORIGINS: list = ["*"]

settings = Settings()

