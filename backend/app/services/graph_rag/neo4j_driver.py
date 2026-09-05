"""Neo4j Enterprise Driver for GreenGru Graph RAG.

Provides async Cypher query execution with connection pooling and graceful
zero-ops fallback to NetworkX if Neo4j is offline or not installed.
"""

from __future__ import annotations

import logging
from typing import Any

from app.config import get_settings

logger = logging.getLogger("greengru.graph_rag.neo4j")

try:
    from neo4j import AsyncDriver, AsyncGraphDatabase
    from neo4j.exceptions import Neo4jError, ServiceUnavailable
    HAS_NEO4J_PKG = True
except ImportError:
    HAS_NEO4J_PKG = False
    AsyncDriver = Any  # type: ignore


class Neo4jManager:
    def __init__(self) -> None:
        self._driver: AsyncDriver | None = None
        self._connected: bool = False
        self._last_error: str | None = None

    async def get_driver(self) -> AsyncDriver | None:
        settings = get_settings()
        if not settings.neo4j_enabled or not HAS_NEO4J_PKG:
            return None

        if self._driver is not None:
            return self._driver

        try:
            self._driver = AsyncGraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password),
                max_connection_lifetime=300,
                max_connection_pool_size=50,
                connection_acquisition_timeout=3.0,
            )
            # Verify connectivity
            await self._driver.verify_connectivity()
            self._connected = True
            self._last_error = None
            logger.info("Connected to Neo4j at %s (database: %s)", settings.neo4j_uri, settings.neo4j_database)
            return self._driver
        except Exception as exc:
            self._connected = False
            self._last_error = str(exc)
            logger.warning("Neo4j unavailable (%s); falling back to NetworkX in-memory graph", exc)
            if self._driver:
                await self._driver.close()
                self._driver = None
            return None

    async def run_query(self, query: str, parameters: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        """Run a parameterized Cypher query. Returns list of record dictionaries.
        Raises RuntimeError if Neo4j is not connected.
        """
        driver = await self.get_driver()
        if not driver:
            raise RuntimeError(f"Neo4j driver not available: {self._last_error or 'disabled'}")

        settings = get_settings()
        async with driver.session(database=settings.neo4j_database) as session:
            result = await session.run(query, parameters or {})
            records = [record.data() async for record in result]
            return records

    async def is_available(self) -> bool:
        driver = await self.get_driver()
        return driver is not None and self._connected

    async def health_check(self) -> dict[str, Any]:
        settings = get_settings()
        available = await self.is_available()
        return {
            "neo4j_enabled": settings.neo4j_enabled,
            "has_neo4j_package": HAS_NEO4J_PKG,
            "connected": available,
            "engine": "neo4j" if available else "networkx_in_memory",
            "uri": settings.neo4j_uri,
            "database": settings.neo4j_database,
            "last_error": self._last_error,
        }

    async def close(self) -> None:
        if self._driver:
            await self._driver.close()
            self._driver = None
            self._connected = False


neo4j_client = Neo4jManager()
