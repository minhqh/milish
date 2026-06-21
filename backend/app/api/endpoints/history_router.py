from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase_client import supabase
from app.schemas.responses import MistakeBankResponse
from app.api.dependencies import get_current_user # Dependency bảo mật JWT

router = APIRouter()

@router.get("/mistake", response_model=MistakeBankResponse)
async def get_mistake_bank(user_id: str = Depends(get_current_user)):
    try:
        response = supabase.table("test_history") \
            .select("id, test_id, total_score, created_at, detailed_results(question_index, user_audio_url, ai_feedback)") \
            .eq("session_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Query Error: {str(e)}")