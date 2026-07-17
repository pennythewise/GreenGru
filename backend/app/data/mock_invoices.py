"""Deterministic mock invoice payloads for OCR preview when PaddleOCR is
unavailable or fields cannot be parsed from noisy OCR text."""

from __future__ import annotations

MOCK_INVOICE_A_WHATSAPP = {
    "invoiceCode": "3400174130",
    "invoiceNumber": "05073978",
    "issueDate": "2017-12-01",
    "buyer": {
        "name": "六安江淮电机有限公司",
        "taxId": "9134150072554518XQ",
        "addressPhone": "安徽省六安市寿春路 · 0564-3368617",
        "bankAccount": "建行六安城北支行 · 3400174620805300512",
    },
    "seller": {
        "name": "合肥市日普贸易有限公司",
        "taxId": "91340100748916334H",
        "addressPhone": "合肥市金寨路162号安徽国际商务中心B座26楼 · 0551-63671971",
        "bankAccount": "徽商银行合肥太湖路支行 · 2051012010004989",
    },
    "items": [
        {
            "name": "碳结圆",
            "spec": "Φ90",
            "unit": "吨",
            "qty": "4.736",
            "unitPrice": "3957.26",
            "amount": "18741.61",
            "taxRate": "17%",
            "tax": "3186.07",
        },
        {
            "name": "碳结圆",
            "spec": "Φ80",
            "unit": "吨",
            "qty": "6.674",
            "unitPrice": "3957.26",
            "amount": "26410.79",
            "taxRate": "17%",
            "tax": "4489.83",
        },
        {
            "name": "碳结圆",
            "spec": "Φ65",
            "unit": "吨",
            "qty": "12.49",
            "unitPrice": "3957.26",
            "amount": "49426.24",
            "taxRate": "17%",
            "tax": "8402.46",
        },
    ],
    "totalAmount": "94578.64",
    "totalTax": "16078.36",
    "totalWithTax": "110657.00",
    "payee": "陈文康",
    "reviewer": "王建",
    "issuer": "陈文康",
}

MOCK_INVOICE_A1_GUANGZHOU = {
    "invoiceCode": "4400203130",
    "invoiceNumber": "08765432",
    "issueDate": "2026-03-18",
    "buyer": {
        "name": "广州市金衡紧固件制造有限公司",
        "taxId": "91440101MA5XXXXX1H",
        "addressPhone": "广东省广州市黄埔区永和经济开发区create路8号 · 020-XXXXXXX",
        "bankAccount": "中国建设银行广州黄埔支行 · 4400 1XXX XXXX 0001",
    },
    "seller": {
        "name": "中国宝武钢铁集团有限公司广州分公司",
        "taxId": "91440000MA5YYYYY2K",
        "addressPhone": "广东省广州市南沙区钢城大道1号 · 020-YYYYYYY",
        "bankAccount": "中国工商银行广州南沙支行 · 3602 1YYY YYYY 0002",
    },
    "items": [
        {
            "name": "热轧卷板",
            "spec": "Q235B 3.0mm",
            "unit": "吨",
            "qty": "128.500",
            "unitPrice": "3850.00",
            "amount": "494725.00",
            "taxRate": "13%",
            "tax": "64314.25",
        },
    ],
    "totalAmount": "494725.00",
    "totalTax": "64314.25",
    "totalWithTax": "559039.25",
    "payee": "陈美玲",
    "reviewer": "李建国",
    "issuer": "王丽芳",
}

MOCK_INVOICE_A2_ANSHAN = {
    "invoiceCode": "210004230217",
    "invoiceNumber": "19283746",
    "issueDate": "2026-05-06",
    "buyer": {
        "name": "鞍山恒昌螺栓紧固件有限公司",
        "taxId": "91210300MA0ZZZZZ3M",
        "addressPhone": "辽宁省鞍山市铁东区兴盛路22号 · 0412-XXXXXXX",
        "bankAccount": "中国农业银行鞍山铁东支行 · 2201 5XXX XXXX 0003",
    },
    "seller": {
        "name": "鞍钢集团鞍山钢铁有限公司",
        "taxId": "91210300MA1WWWWW4P",
        "addressPhone": "辽宁省鞍山市铁东区胜利路63号 · 0412-YYYYYYY",
        "bankAccount": "中国银行鞍山分行 · 2103 6YYY YYYY 0004",
    },
    "items": [
        {
            "name": "线材",
            "spec": "SWRCH35K Φ8.0mm",
            "unit": "吨",
            "qty": "86.200",
            "unitPrice": "4120.00",
            "amount": "355144.00",
            "taxRate": "13%",
            "tax": "46168.72",
        },
    ],
    "totalAmount": "355144.00",
    "totalTax": "46168.72",
    "totalWithTax": "401312.72",
    "payee": "赵德海",
    "reviewer": "周慧敏",
    "issuer": "孙立群",
}


def pick_mock_invoice(filename: str, ocr_text: str = "") -> dict:
    """Choose the closest mock invoice by filename hint or OCR keywords."""
    name = (filename or "").lower()
    blob = (ocr_text or "").lower()

    if "sample_a1" in name or "4400203130" in blob or "金衡紧固件" in blob or "宝武" in blob:
        return {**MOCK_INVOICE_A1_GUANGZHOU, "_mock_template": "sample_a1"}
    if "sample_a2" in name or "210004230217" in blob or "恒昌螺栓" in blob or "鞍钢" in blob:
        return {**MOCK_INVOICE_A2_ANSHAN, "_mock_template": "sample_a2"}
    return {**MOCK_INVOICE_A_WHATSAPP, "_mock_template": "default"}
