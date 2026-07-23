"""Application-form flatten + hash helpers (no network)."""

from app.services.rag.form_store import application_form_to_markdown, form_content_hash


def test_flatten_includes_filled_fields_only():
    md = application_form_to_markdown(
        "loan",
        {
            "company_information": {
                "company_name": "测试公司",
                "phone": "",
                "enterprise_size": {"small": True, "large": False},
            },
            "use_of_funds_category": {
                "selected_category_number": 3,
                "categories": [
                    {"number": 3, "name_cn": "工业节能", "name_en": "x", "selected": True},
                    {"number": 1, "name_cn": "农业", "name_en": "y", "selected": False},
                ],
            },
        },
    )
    assert "测试公司" in md
    assert "phone" not in md
    assert "selected_category" in md
    assert "工业节能" in md
    assert form_content_hash({"a": 1}) == form_content_hash({"a": 1})
