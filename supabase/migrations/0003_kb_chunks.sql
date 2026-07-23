-- Channel-scoped knowledge-base chunks for RAG pre-screeners / advisory
-- (EU CBAM, loan, grant). Separate from intake document_embeddings.
-- Requires pgvector. Safe to skip on SQLite — backend falls back to
-- ./storage/kb_embeddings/{channel}/*.json

create extension if not exists vector;

create table if not exists kb_chunks (
    id uuid primary key default gen_random_uuid(),
    channel text not null check (channel in ('cbam', 'loan', 'grant')),
    language text not null default 'en',
    source_file text not null,
    file_hash text not null,
    heading_path text not null default '',
    chunk_index int not null,
    chunk_text text not null,
    embedding vector(1024),
    model text not null default 'qwen/qwen3-embedding-8b',
    created_at timestamptz not null default now(),
    unique (file_hash, chunk_index)
);

create index if not exists kb_chunks_channel_lang_idx
    on kb_chunks (channel, language);

create index if not exists kb_chunks_file_hash_idx
    on kb_chunks (file_hash);

create index if not exists kb_chunks_embedding_idx
    on kb_chunks using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- Cosine similarity search for one channel (and optional language).
create or replace function match_kb_chunks(
    query_embedding vector(1024),
    match_channel text,
    match_count int default 6,
    match_language text default null
)
returns table (
    id uuid,
    channel text,
    language text,
    source_file text,
    heading_path text,
    chunk_index int,
    chunk_text text,
    similarity float
)
language sql stable
as $$
    select
        c.id,
        c.channel,
        c.language,
        c.source_file,
        c.heading_path,
        c.chunk_index,
        c.chunk_text,
        1 - (c.embedding <=> query_embedding) as similarity
    from kb_chunks c
    where c.channel = match_channel
      and (match_language is null or c.language = match_language)
    order by c.embedding <=> query_embedding
    limit greatest(match_count, 1);
$$;
