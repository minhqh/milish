from fastapi import APIRouter, HTTPException
from app.schemas.grading_models import WritingRequest
from app.services.gemini_client import grade_writing_with_gemini
from app.services.supabase_client import supabase 

router = APIRouter()

@router.post("/grade")
async def grade_writing(request: WritingRequest):
    try:
        result = grade_writing_with_gemini(
            api_key=request.api_key,
            question=request.question,
            user_response=request.user_response
        )
        
        # 2. Quản lý test_history (Kiểm tra xem đã có lịch sử làm bài chưa)
        history_res = supabase.table("test_history") \
            .select("id") \
            .eq("session_id", request.session_id) \
            .eq("test_id", request.test_id) \
            .execute()
            
        if len(history_res.data) > 0:
            history_id = history_res.data[0]['id'] # Đã có lịch sử
        else:
            # Chưa có, tạo lịch sử mới
            history_data = {
                "test_id": request.test_id,
                "session_id": request.session_id,
                "total_score": 0
            }
            insert_res = supabase.table("test_history").insert(history_data).execute()
            history_id = insert_res.data[0]['id']

        # 3. Ghi chuẩn dữ liệu vào bảng detailed_results
        detailed_data = {
            "history_id": history_id,
            "question_index": request.question_index,
            "user_answer_text": request.user_response, # Lưu bài gõ essay của thí sinh
            "user_audio_url": None,                    # Bỏ trống vì đây là Writing
            "ai_feedback": result                      # Lưu TOÀN BỘ dict JSON trả về từ Gemini
        }
        supabase.table("detailed_results").insert(detailed_data).execute()

        # 4. Trả response chuẩn về Frontend
        return {
            "status": "success",
            "history_id": history_id,
            "question_index": request.question_index,
            "feedback": result
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Database/AI Error: {str(e)}")