from fastapi import APIRouter, HTTPException
from app.schemas.grading_models import WritingRequest, GradingResult
from app.services.gemini_client import grade_writing_with_gemini

router = APIRouter()

@router.post("/grade", response_model=GradingResult)
async def grade_writing(request: WritingRequest):
    try:
        result = grade_writing_with_gemini(
            api_key=request.api_key,
            question=request.question,
            user_response=request.user_response
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")