"""Program matcher (PRD §8.8) — deterministic lookup, no LLM. Thin service
wrapper around app.data.subsidy_programs so routers have a stable import
path independent of where the underlying data table lives."""

from app.data.subsidy_programs import SubsidyProgram, match_programs

__all__ = ["SubsidyProgram", "match_programs"]
