"""RAG package — MinerU → LangChain chunk → embed → Supabase kb_chunks."""

from app.services.rag.chunking import KbChunk, chunk_markdown
from app.services.rag.embed_store import ingest_markdown_to_kb, store_kb_chunks
from app.services.rag.mineru_convert import convert_pdf_to_markdown
from app.services.rag.retrieve import RetrievedChunk, format_chunks_for_prompt, retrieve_kb

__all__ = [
    "KbChunk",
    "RetrievedChunk",
    "chunk_markdown",
    "convert_pdf_to_markdown",
    "format_chunks_for_prompt",
    "ingest_markdown_to_kb",
    "retrieve_kb",
    "store_kb_chunks",
]
