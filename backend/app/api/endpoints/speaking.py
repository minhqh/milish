from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.services.gemini_client import grade_speaking_with_gemini
from app.services.supabase_client import supabase
import uuid
import time

router = APIRouter()

@router.post("/grade")
async def grade_speaking(
    api_key: str = Form(...),
    question: str = Form(...),
    test_id: str = Form(...),          # ID của đề thi (từ bảng tests)
    session_id: str = Form(...),       # Mã ẩn danh của người dùng
    question_index: int = Form(...),   # Số thứ tự câu hỏi trong đề
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

        file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
        unique_filename = f"record_{session_id}_{uuid.uuid4().hex[:8]}_{int(time.time())}.{file_ext}"
        
        supabase.storage.from_("speaking_records").upload(
            file=audio_bytes,
            path=unique_filename,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase.storage.from_("speaking_records").get_public_url(unique_filename)
        
        # 3. Quản lý test_history (Kiểm tra xem đã có lịch sử làm bài cho session này chưa)
        history_res = supabase.table("test_history") \
            .select("id") \
            .eq("session_id", session_id) \
            .eq("test_id", test_id) \
            .execute()
            
        if len(history_res.data) > 0:
            history_id = history_res.data[0]['id'] # Đã có lịch sử, lấy ID
        else:
            # Chưa có, tạo lịch sử mới cho bài thi này
            history_data = {
                "test_id": test_id,
                "session_id": session_id,
                "total_score": 0 # Sẽ cộng dồn điểm sau khi hoàn thành toàn bộ bài thi
            }
            insert_res = supabase.table("test_history").insert(history_data).execute()
            history_id = insert_res.data[0]['id']

        # 4. Ghi chuẩn dữ liệu vào bảng detailed_results
        detailed_data = {
            "history_id": history_id,
            "question_index": question_index,
            "user_answer_text": None,    # Bỏ trống vì đây là Speaking
            "user_audio_url": public_url, 
            "ai_feedback": result        # Lưu TOÀN BỘ dict JSON trả về từ Gemini
        }
        supabase.table("detailed_results").insert(detailed_data).execute()

        return {
            "status": "success",
            "history_id": history_id,
            "question_index": question_index,
            "audio_url": public_url,
            "feedback": result
        }
    
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=f"AI Speaking Error: {str(e)}")