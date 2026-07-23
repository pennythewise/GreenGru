# Knowledge base — Grant / 绿色工厂 (GB/T 36132)

Canonical source: `GB-T-36132-2025-绿色工厂评价通则.pdf` (primary-sources).

```bash
# from backend/
python -m scripts.ingest_kb_grant
```

Pipeline: **MinerU** → **LangChain** → **Qwen3-Embedding-8B** → `kb_chunks` (`channel=grant`).

Query API: `POST /api/rag/query` with `{"channel":"grant","query":"...","language":"zh"}`.
