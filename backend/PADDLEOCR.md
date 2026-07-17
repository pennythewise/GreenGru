# PaddleOCR (removed chineseocr sidecar)

GreenGru runs **PaddleOCR in-process** inside the FastAPI backend for Stage-1 invoice photo OCR.

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
OCR_INTAKE_TIMEOUT_S=5          # qwen3.7-plus vision fallback step
OCR_MOCK_ONLY=false             # set true to skip OCR and use mock templates
```

## Pipeline

```
image upload → PaddleOCR (zh+en) → invoice field parse → qwen classify
                    ↓ (if empty/timeout)
              qwen3.7-plus vision (5s)
                    ↓
              mock invoice template
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ConvertPirAttribute2RuntimeAttribute` / oneDNN error on Windows | `PADDLEOCR_ENABLE_MKLDNN=false` (default) |
| First upload slow | Models downloading; increase `PADDLEOCR_TIMEOUT_S` |
| Model download fails | Set `PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True` (already default in code) |
| Skip OCR for demos | `OCR_MOCK_ONLY=true` |

## Removed

The `chineseocr/` sidecar has been **removed**. OCR runs in-process via PaddleOCR.

Reference: [PaddleOCR on GitHub](https://github.com/PaddlePaddle/PaddleOCR)
