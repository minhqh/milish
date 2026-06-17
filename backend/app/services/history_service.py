from app.services.supabase_client import supabase

def get_or_create_test_history(user_id: str, test_id: str) -> int:
    """Kiểm tra xem đã có lịch sử làm bài chưa, nếu chưa thì tạo mới[cite: 2, 3]."""
    history_res = supabase.table("test_history") \
        .select("id") \
        .eq("session_id", user_id) \
        .eq("test_id", test_id) \
        .execute()
        
    if len(history_res.data) > 0:
        return history_res.data[0]['id']
    else:
        history_data = {
            "test_id": test_id,
            "session_id": user_id,  # Lưu ý: Sẽ dùng user_id thật từ JWT
            "total_score": 0
        }
        insert_res = supabase.table("test_history").insert(history_data).execute()
        return insert_res.data[0]['id']

def save_detailed_result(history_id: int, question_index: int, user_answer_text: str | None, user_audio_url: str | None, ai_feedback: dict):
    """Ghi dữ liệu vào bảng detailed_results[cite: 2, 3]."""
    detailed_data = {
        "history_id": history_id,
        "question_index": question_index,
        "user_answer_text": user_answer_text,
        "user_audio_url": user_audio_url, 
        "ai_feedback": ai_feedback
    }
    supabase.table("detailed_results").insert(detailed_data).execute()