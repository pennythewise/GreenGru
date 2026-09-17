from app.services import llm_client as m
import pytest
from openai import APIConnectionError
import httpx

class _Msg:  content = "```json\n{\"a\": 1}\n```"
class _Choice: message = _Msg()
class _Resp: choices = [_Choice()]

def test_fenced_json_parsed(monkeypatch):
    monkeypatch.setattr(m, "is_mock_mode", lambda **_: False)
    class C:
        class chat:
            class completions:
                @staticmethod
                def create(**_): return _Resp()
    monkeypatch.setattr(m, "get_client", lambda **_: C())
    assert m.call_structured(model="x", system_prompt="", user_prompt="", mock_response={}) == {"a": 1}

def test_non_json_raises(monkeypatch):
    monkeypatch.setattr(m, "is_mock_mode", lambda **_: False)
    _Msg.content = "sorry, I cannot"
    class C:
        class chat:
            class completions:
                @staticmethod
                def create(**_): return _Resp()
    monkeypatch.setattr(m, "get_client", lambda **_: C())
    with pytest.raises(m.LlmCallError, match="non-JSON"):
        m.call_structured(model="x", system_prompt="", user_prompt="", mock_response={})

def test_api_error_raises(monkeypatch):
    monkeypatch.setattr(m, "is_mock_mode", lambda **_: False)
    class C:
        class chat:
            class completions:
                @staticmethod
                def create(**_): raise APIConnectionError(request=httpx.Request("POST", "http://x"))
    monkeypatch.setattr(m, "get_client", lambda **_: C())
    with pytest.raises(m.LlmCallError):
        m.call_prose(model="x", system_prompt="", user_prompt="", mock_response="")
