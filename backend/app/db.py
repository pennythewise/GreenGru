"""Async SQLAlchemy engine/session setup.

Works against either the zero-config local SQLite file (default) or a real
Supabase/Postgres `DATABASE_URL` — same models, same code path, per
config.py's comment on why that's a safe simplification for this project.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

_connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}

engine = create_async_engine(settings.database_url, echo=False, connect_args=_connect_args)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    """Create tables if they don't exist yet. For SQLite dev mode this is
    all that's needed. For Supabase/Postgres, prefer running
    supabase/migrations/0001_init.sql directly — this call is a harmless
    no-op against a database that already has the tables."""
    import app.models_orm  # noqa: F401 — ensure models are registered on Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    # create_all is a no-op when tables already exist — cheap enough to run
    # on every request, and it recovers automatically if the SQLite file was
    # deleted/recreated while the server process was still running (which is
    # exactly what triggers "no such table: companies" / the frontend's generic
    # "Something went wrong" message).
    await init_db()
    async with async_session_factory() as session:
        yield session
