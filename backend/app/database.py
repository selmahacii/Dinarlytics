"""
Database connection and SQLAlchemy configuration
"""

from sqlalchemy import create_engine, event, Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import QueuePool
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy base for models
Base = declarative_base()

# Create database engine with connection pooling
def get_engine() -> Engine:
    """Create and return SQLAlchemy engine with connection pooling"""
    
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DATABASE_ECHO,
        echo_pool=False,
        connect_args={
            "connect_timeout": 10,
            "application_name": settings.APP_NAME
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
    Dependency for getting database session
    Usage: async def my_endpoint(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
