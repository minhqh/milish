from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.services.gemini_client import grade_speaking_with_gemini

router = APIRouter()

@router.post("/grade")
async def grade_speaking(
    api_key: str = Form(...),
    question: str = Form(...),
    file: UploadFile = File(...)
):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    try:
        audio_bytes = await file.read()
        
        result = grade_speaking_with_gemini(
            api_key=api_key,
            question=question,
            audio_bytes=audio_bytes,
            mime_type=file.content_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Speaking Error: {str(e)}")