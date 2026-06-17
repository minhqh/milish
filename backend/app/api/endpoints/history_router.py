from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase

router = APIRouter()

@router.get("/mistake-bank/{session_id}")
async def get_mistake_bank(session_id: str):
    try:
        response = supabase.table("test_history") \
            .select("id, test_id, total_score, created_at, detailed_results(question_index, user_audio_url, ai_feedback)") \
            .eq("session_id", session_id) \
            .order("created_at", desc=True) \
            .execute()
        
        return {
            "status": "success",
            "data": response.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Query Error: {str(e)}")