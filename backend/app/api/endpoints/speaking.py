from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from app.services.gemini_client import grade_speaking_with_gemini
from app.services import storage_service, history_service
from app.utils.file_handlers import validate_audio_file, generate_unique_filename
from app.schemas.responses import GradeResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/grade", response_model=GradeResponse)
async def grade_speaking(
    api_key: str = Form(...),
    question: str = Form(...),
    test_id: str = Form(...),
    question_index: int = Form(...),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user) # Bắt user_id từ Token
):
    validate_audio_file(file)

    try:
        audio_bytes = await file.read()
        
        # 1. Gọi Gemini
        result = grade_speaking_with_gemini(api_key, question, audio_bytes, file.content_type)

        # 2. Upload file
        unique_filename = generate_unique_filename(user_id, file.filename)
        public_url = storage_service.upload_audio_to_supabase(audio_bytes, unique_filename, file.content_type)
        
        # 3. Quản lý Database
        history_id = history_service.get_or_create_test_history(user_id, test_id)
        history_service.save_detailed_result(history_id, question_index, None, public_url, result)

        return {
            "status": "success",
            "history_id": history_id,
            "question_index": question_index,
            "audio_url": public_url,
            "feedback": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Speaking Error: {str(e)}")