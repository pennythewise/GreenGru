-- Document embedding vectors for PDF intake (Qwen3-Embedding-8B @ 1024-d)
-- Requires pgvector on Supabase Postgres. Safe to skip on SQLite dev —
-- the backend falls back to ./storage/embeddings/*.json locally.

create extension if not exists vector;

create table if not exists document_embeddings (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    file_hash text not null,
    chunk_index int not null,
    chunk_text text not null,
    embedding vector(1024),
    model text not null default 'text-embedding-v4',
    created_at timestamptz not null default now()
);

create index if not exists document_embeddings_file_hash_idx
    on document_embeddings (file_hash);

create index if not exists document_embeddings_embedding_idx
    on document_embeddings using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);
