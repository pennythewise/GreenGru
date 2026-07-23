# Knowledge base — EU CBAM

Place the official CBAM installation-operator guidance PDF under `source/`
(ingest script copies it automatically), then run from `backend/`:

```bash
# Optional: install MinerU from the git clone (heavy; CPU pipeline OK)
# pip install -e ../third_party/MinerU

python -m scripts.ingest_kb_cbam
```

Pipeline: **MinerU** (PDF → Markdown) → **LangChain** math-safe chunks →
**Qwen3-Embedding-8B** → Supabase `kb_chunks` (`channel=cbam`).

Apply migration: `supabase/migrations/0003_kb_chunks.sql`.

Query API: `POST /api/rag/query` with `{"channel":"cbam","query":"..."}`.
