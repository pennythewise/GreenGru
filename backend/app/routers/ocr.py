"""Legacy OCR upload alias — delegates to the canonical intake OCR preview path.

New Submission uses POST /api/intake/ocr-preview directly. This router exists only
so older clients hitting /ocr/upload-image/ still receive the same response shape.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ocr_preview import run_ocr_preview

router = APIRouter()


@router.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=422, detail="Filename is required.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Empty file upload.")
    return await run_ocr_preview(content=content, filename=file.filename)
