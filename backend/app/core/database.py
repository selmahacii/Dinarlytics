"""
Database connection and SQLAlchemy configuration
"""

from sqlalchemy import create_engine, event, Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import QueuePool
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy base for models
Base = declarative_base()

# Create database engine with connection pooling
def get_engine() -> Engine:
    """Create and return SQLAlchemy engine with connection pooling"""
    
    print(f"Connecting to DB: {settings.DATABASE_URL}")
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        connect_args={
            "connect_timeout": 10,
            "application_name": "Dinarlytics_Backend_ASCII"
        }
    )
    
    # Set up event listeners for connection management
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        """Configure connection when created"""
        # Set timezone to UTC for PostgreSQL
        try:
            cursor = dbapi_conn.cursor()
            cursor.execute("SET timezone='UTC'")
            cursor.close()
        except Exception as e:
            logger.warning(f"Could not set timezone: {e}")
    
    return engine

# Create engine instance
engine = get_engine()

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

def get_db() -> Session:
    """
    Dependency for getting database session.
    Automatically handles session context for audit triggers.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def set_db_user_context(db: Session, user_id: str):
    """
    Sets the current user ID in the Postgres session context.
    REQUIRED for the audit_generic_trigger to work.
    """
    try:
        db.execute(f"SET LOCAL app.current_user_id = '{user_id}'")
    except Exception as e:
        logger.error(f"Failed to set DB user context: {e}")

def init_db():
    """Initialize database - create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def close_db():
    """Close database connections"""
    engine.dispose()
    logger.info("Database connections closed")
