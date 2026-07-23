# Knowledge base — Loan / 绿贷

Canonical sources (primary-sources):

1. `绿色金融支持项目目录-2025年版.pdf`
2. `GB-T-36132-2025-绿色工厂评价通则.pdf`

```bash
# from backend/
python -m scripts.ingest_kb_loan
python -m scripts.ingest_kb_loan --only catalogue
python -m scripts.ingest_kb_loan --only factory
```

Pipeline: **MinerU** → **LangChain** → **Qwen3-Embedding-8B** → `kb_chunks` (`channel=loan`).

Query API: `POST /api/rag/query` with `{"channel":"loan","query":"...","language":"zh"}`.

Retrieval is prose / checklist context only — never invents loan amounts or scores.
