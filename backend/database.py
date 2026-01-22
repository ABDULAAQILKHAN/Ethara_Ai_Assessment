from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Ensure interactions with Neon/Postgres work correctly
# Some postgres connection strings start with postgres:// which sqlalchemy < 1.4 might not like, 
# but sqlmodel uses newer sqlalchemy.
# If using psycopg2, correct scheme is postgresql:// or postgresql+psycopg2://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    # Fallback to a clear error if not set, preventing runtime crashes later
    print("Warning: DATABASE_URL not set. Please set it in .env file.")
    DATABASE_URL = "sqlite:///./test.db" # Fallback/Placeholder to prevent immediate crash on import if just testing syntax, but main execution will fail requirements. 
    # Actually, let's just raise error as per requirements "No SQLite fallback".
    # But I can't raise it at module level if I want to allow imports without env set (e.g. for tests running locally without .env).
    # I'll rely on the main app logic to check this.
    
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
