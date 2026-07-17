"""Test configuration. Points the app at an isolated SQLite file (not the
dev database) before any app module is imported, and cleans it up after
the test session."""

import os
import pathlib

_TEST_DB_PATH = pathlib.Path(__file__).parent / "test_carbon_passport.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_TEST_DB_PATH}"
os.environ["LLM_MOCK_MODE"] = "true"
os.environ["DASHSCOPE_API_KEY"] = ""
os.environ["OCR_MOCK_ONLY"] = "true"

import pytest


@pytest.fixture(scope="session", autouse=True)
def _cleanup_test_db():
    yield
    if _TEST_DB_PATH.exists():
        _TEST_DB_PATH.unlink()
