from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings

settings = get_settings()

# Remove unsupported params from Neon connection string for asyncpg
database_url = settings.DATABASE_URL
if "channel_binding=require" in database_url:
    database_url = database_url.replace("channel_binding=require", "")
    database_url = database_url.replace("&&", "&").rstrip("&").rstrip("?")

engine = create_async_engine(database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
