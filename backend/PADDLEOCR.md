# PaddleOCR (removed chineseocr sidecar)

GreenGru runs **PaddleOCR in-process** inside the FastAPI backend for New Submission
invoice photo OCR.

## Install

```powershell
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
```

First OCR request downloads PP-OCRv4 models (~15 MB) into `%USERPROFILE%\.paddlex\official_models\`.

## Configure `.env`

```env
PADDLEOCR_ENABLED=true
PADDLEOCR_LANG=ch          # 简体中文 + English (not other languages)
PADDLEOCR_VERSION=PP-OCRv4
PADDLEOCR_ENABLE_MKLDNN=false   # required on Windows CPU
PADDLEOCR_TIMEOUT_S=45          # first run needs model download time
OCR_INTAKE_TIMEOUT_S=90         # Qwen-VL vision fallback (235B needs headroom)
OCR_MOCK_ONLY=false             # set true to skip OCR and use mock templates
MODEL_INTAKE_VISION=qwen/qwen3-vl-235b-a22b-thinking
LLM_VISION_API_KEY=             # optional; falls back to LLM_API_KEY
```

## Pipeline

```
image upload → PaddleOCR (zh+en) → invoice field parse → qwen3.6-flash classify
                    ↓ (if empty/timeout)
              qwen/qwen3-vl-235b-a22b-thinking
                    ↓
              mock invoice template
```

Scanned PDFs with no text layer use the same VL model via page render.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ConvertPirAttribute2RuntimeAttribute` / oneDNN error on Windows | `PADDLEOCR_ENABLE_MKLDNN=false` (default) |
| First upload slow | Models downloading; increase `PADDLEOCR_TIMEOUT_S` |
| Model download fails | Set `PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True` (already default in code) |
| VL timeout | Increase `OCR_INTAKE_TIMEOUT_S` (default 90) |
| Skip OCR for demos | `OCR_MOCK_ONLY=true` |

## Removed

The `chineseocr/` sidecar has been **removed**. OCR runs in-process via PaddleOCR.

Reference: [PaddleOCR on GitHub](https://github.com/PaddlePaddle/PaddleOCR)
