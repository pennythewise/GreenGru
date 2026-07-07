"""PRD §8.3 — classifier out_of_scope escape hatch and the single
Flash->Plus escalation path (PRD §4.1's only model-escalation path)."""

import app.services.classifier_agent as classifier_module


def test_out_of_scope_routes_to_manual_confirmation(monkeypatch):
    calls = []

    def fake_call_structured(*, model, system_prompt, user_prompt, mock_response, temperature=0.0):
        calls.append(model)
        return {"cn_code": "out_of_scope", "confidence": 0.9}

    monkeypatch.setattr(classifier_module, "call_structured", fake_call_structured)

    result = classifier_module.classify_product("Aluminum extrusion profile")
    assert result.cn_code == "out_of_scope"
    assert result.requires_manual_confirmation is True
    # out_of_scope with high confidence still triggers escalation per the
    # `needs_escalation` check (cn_code == "out_of_scope"), confirming the
    # single-retry path runs even when confidence alone wouldn't trigger it.
    assert result.escalated is True
    assert len(calls) == 2


def test_low_confidence_escalates_exactly_once_then_stops(monkeypatch):
    call_count = {"n": 0}

    def fake_call_structured(*, model, system_prompt, user_prompt, mock_response, temperature=0.0):
        call_count["n"] += 1
        return {"cn_code": "7301", "confidence": 0.5}  # always low confidence

    monkeypatch.setattr(classifier_module, "call_structured", fake_call_structured)

    result = classifier_module.classify_product("Some steel bracket")
    assert call_count["n"] == 2  # first pass + exactly one escalation, never a third call
    assert result.requires_manual_confirmation is True


def test_high_confidence_first_pass_never_escalates(monkeypatch):
    call_count = {"n": 0}

    def fake_call_structured(*, model, system_prompt, user_prompt, mock_response, temperature=0.0):
        call_count["n"] += 1
        return {"cn_code": "7318 15 88", "confidence": 0.95}

    monkeypatch.setattr(classifier_module, "call_structured", fake_call_structured)

    result = classifier_module.classify_product("Hex head screw, M8x40")
    assert call_count["n"] == 1
    assert result.escalated is False
    assert result.requires_manual_confirmation is False
    assert result.cn_code == "7318 15 88"


def test_cn_code_hint_disagreement_forces_manual_confirmation(monkeypatch):
    def fake_call_structured(*, model, system_prompt, user_prompt, mock_response, temperature=0.0):
        return {"cn_code": "7318 15 88", "confidence": 0.95}

    monkeypatch.setattr(classifier_module, "call_structured", fake_call_structured)

    result = classifier_module.classify_product("Hex head screw", cn_code_hint="7326")
    assert result.requires_manual_confirmation is True
    assert "disagrees" in result.reason
