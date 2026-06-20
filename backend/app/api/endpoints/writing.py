from fastapi import APIRouter, HTTPException, Depends
from app.schemas.grading_models import WritingRequest
from app.schemas.responses import GradeResponse 
from app.services.grading_service import GradingService
from app.services import history_service
from app.api.dependencies import get_current_user # Chốt chặn JWT

router = APIRouter()

@router.post("/grade", response_model=GradeResponse)
async def grade_writing(
    request: WritingRequest,
    user_id: str = Depends(get_current_user) # Bắt buộc phải có JWT mới cho qua
):
    try:
        # 1. Gọi Gemini chấm điểm
        result = GradingService.grade_writing(
            api_key=request.api_key,
            question=request.question,
            user_response=request.user_response
        )
        
        # 2. & 3. Quản lý Database qua Service (Gọn gàng, không lặp code)
        history_id = history_service.get_or_create_test_history(user_id, request.test_id)
        
        history_service.save_detailed_result(
            history_id=history_id,
            question_index=request.question_index,
            user_answer_text=request.user_response,
            user_audio_url=None, # Bỏ trống vì đây là Writing
            ai_feedback=result
        )

        # 4. Trả response chuẩn về Frontend
        return {
            "status": "success",
            "history_id": history_id,
            "question_index": request.question_index,
            "audio_url": None, # Thêm vào cho khớp với GradeResponse (nếu xài chung với Speaking)
            "feedback": result
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Database/AI Error: {str(e)}")