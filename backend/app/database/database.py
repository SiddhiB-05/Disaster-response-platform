from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

db_url = settings.DATABASE_URL

# Clean parameters if present
if "channel_binding" in db_url:
    db_url = db_url.split("&channel_binding=")[0].split("?channel_binding=")[0]

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {"connect_timeout": 3}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
    print(f"[Database] Successfully connected to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    print(f"[Database Warning] Could not connect to Cloud PostgreSQL ({db_url.split('@')[-1] if '@' in db_url else db_url}): {e}")
    print("[Database] Falling back to SQLite local database (disaster_response.db)...")
    db_url = "sqlite:///./disaster_response.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

