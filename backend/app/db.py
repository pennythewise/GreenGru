"""Async SQLAlchemy engine/session setup.

Works against either the zero-config local SQLite file (default) or a real
Supabase/Postgres `DATABASE_URL` — same models, same code path, per
config.py's comment on why that's a safe simplification for this project.
"""

from collections.abc import AsyncGenerator

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

_is_sqlite = "sqlite" in settings.database_url
_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_async_engine(settings.database_url, echo=False, connect_args=_connect_args)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


# Set once the (non-SQLite) database has been confirmed to carry the real
# migrated schema, so we don't re-inspect on every request.
_schema_verified = False


async def init_db() -> None:
    """SQLite dev mode: create tables if they don't exist yet — that's all
    the zero-config local database needs.

    Supabase/Postgres: never auto-create. `Base.metadata.create_all` would
    silently self-provision bare tables — no CHECK constraints, no RLS, no
    baowu_dashboard_role — which violates the PRD §10 database-level data
    segregation rule. Instead, verify the migrated schema is present and
    tell the operator how to apply it if not."""
    global _schema_verified

    import app.models_orm  # noqa: F401 — ensure models are registered on Base

    if _is_sqlite:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        return

    if _schema_verified:
        return

    expected = set(Base.metadata.tables)
    async with engine.connect() as conn:
        existing = set(await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names()))
    missing = sorted(expected - existing)
    if missing:
        raise RuntimeError(
            "Database is missing tables: "
            + ", ".join(missing)
            + ". Refusing to auto-create schema on a non-SQLite database — "
            "that would produce bare tables without CHECK constraints, RLS, "
            "or the baowu_dashboard_role. Apply the real migration first: "
            "run backend/scripts/apply_supabase_schema.sh "
            "(applies supabase/migrations/0001_init.sql)."
        )
    _schema_verified = True


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    # For SQLite, create_all is a no-op when tables already exist — cheap
    # enough to run on every request, and it recovers automatically if the
    # SQLite file was deleted/recreated while the server process was still
    # running (which is exactly what triggers "no such table: companies" /
    # the frontend's generic "Something went wrong" message). For Postgres,
    # init_db only verifies the schema (once), never creates it.
    await init_db()
    async with async_session_factory() as session:
        yield session
