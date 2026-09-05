"""CLI utility to seed Neo4j with GreenGru metallurgical & regulatory graph.

Usage:
    python backend/scripts/seed_neo4j.py [--uri bolt://localhost:7687] [--user neo4j] [--password greengru]
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.graph_rag.ontology import EDGES, NODES

try:
    from neo4j import AsyncGraphDatabase
except ImportError:
    print("[ERROR] neo4j package not installed. Run: pip install neo4j>=5.18.0")
    sys.exit(1)


async def seed_neo4j(uri: str, user: str, password: str, database: str = "neo4j") -> None:
    print(f"[*] Connecting to Neo4j at {uri} (database: {database})...")
    driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
    try:
        await driver.verify_connectivity()
        print("[+] Connected successfully!")
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        await driver.close()
        sys.exit(1)

    async with driver.session(database=database) as session:
        print("[*] Creating constraints and indexes...")
        await session.run("CREATE CONSTRAINT unique_entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;")
        await session.run("CREATE INDEX entity_layer IF NOT EXISTS FOR (e:Entity) ON (e.layer);")

        print(f"[*] Merging {len(NODES)} nodes...")
        for n in NODES:
            nid = n["id"]
            layer = n.get("layer", "process")
            # Label based on layer
            label_map = {
                "process": "ProcessNode",
                "material": "MaterialNode",
                "customs": "CustomsNode",
                "boundary": "CBAMBoundaryNode",
                "policy": "PolicyNode",
                "emission": "EmissionSourceNode",
            }
            extra_label = label_map.get(layer, "Entity")
            props = {k: v for k, v in n.items()}

            cypher = f"""
            MERGE (e:Entity:{extra_label} {{id: $id}})
            SET e += $props
            """
            await session.run(cypher, {"id": nid, "props": props})

        print(f"[*] Merging {len(EDGES)} relationships...")
        for e in EDGES:
            src = e["source"]
            tgt = e["target"]
            rel = e.get("rel", "RELATED_TO")
            edge_props = {k: v for k, v in e.items() if k not in ("source", "target", "rel")}

            cypher = f"""
            MATCH (a:Entity {{id: $src}}), (b:Entity {{id: $tgt}})
            MERGE (a)-[r:{rel}]->(b)
            SET r += $props
            """
            await session.run(cypher, {"src": src, "tgt": tgt, "props": edge_props})

        count_nodes_res = await session.run("MATCH (n:Entity) RETURN count(n) AS c;")
        node_count = (await count_nodes_res.single())["c"]
        count_rels_res = await session.run("MATCH ()-[r]->() RETURN count(r) AS c;")
        rel_count = (await count_rels_res.single())["c"]

        print(f"[+] Seeding complete! Total Nodes in Graph: {node_count}, Relationships: {rel_count}")

    await driver.close()


def main():
    parser = argparse.ArgumentParser(description="Seed Neo4j database with GreenGru metallurgical ontology")
    parser.add_argument("--uri", default=os.getenv("NEO4J_URI", "bolt://localhost:7687"))
    parser.add_argument("--user", default=os.getenv("NEO4J_USER", "neo4j"))
    parser.add_argument("--password", default=os.getenv("NEO4J_PASSWORD", "greengru"))
    parser.add_argument("--database", default=os.getenv("NEO4J_DATABASE", "neo4j"))

    args = parser.parse_args()
    asyncio.run(seed_neo4j(args.uri, args.user, args.password, args.database))


if __name__ == "__main__":
    main()
