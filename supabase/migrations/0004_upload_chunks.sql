-- User-upload chunks for Stage 1 pre-screener RAG (channel + session scoped).
-- Static regulatory KB stays in kb_chunks; uploads live here.
-- Requires pgvector. Backend falls back to ./storage/upload_embeddings/{channel}/

create extension if not exists vector;

create table if not exists upload_chunks (
    id uuid primary key default gen_random_uuid(),
    channel text not null check (channel in ('cbam', 'loan', 'grant')),
    upload_session_id text not null,
    checklist_item text not null default '',
    language text not null default 'en',
    source_file text not null,
    file_hash text not null,
    heading_path text not null default '',
    chunk_index int not null,
    chunk_text text not null,
    embedding vector(1024),
    model text not null default 'qwen/qwen3-embedding-8b',
    created_at timestamptz not null default now(),
    unique (upload_session_id, file_hash, chunk_index)
);

create index if not exists upload_chunks_session_idx
    on upload_chunks (channel, upload_session_id);

create index if not exists upload_chunks_file_hash_idx
    on upload_chunks (file_hash);

create index if not exists upload_chunks_embedding_idx
    on upload_chunks using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

create or replace function match_upload_chunks(
    query_embedding vector(1024),
    match_channel text,
    match_session text,
    match_count int default 3,
    match_language text default null
)
returns table (
    id uuid,
    channel text,
    upload_session_id text,
    checklist_item text,
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
        c.upload_session_id,
        c.checklist_item,
        c.language,
        c.source_file,
        c.heading_path,
        c.chunk_index,
        c.chunk_text,
        1 - (c.embedding <=> query_embedding) as similarity
    from upload_chunks c
    where c.channel = match_channel
      and c.upload_session_id = match_session
      and (match_language is null or c.language = match_language)
    order by c.embedding <=> query_embedding
    limit greatest(match_count, 1);
$$;
