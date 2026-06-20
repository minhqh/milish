import requests
from fastapi import HTTPException
from app.services.supabase_client import supabase
from app.services.gemini_client import GeminiService

class GradingService:
    @staticmethod
    def grade_answer(detail_id: str, api_key: str) -> dict:
        try:
            # 1. Rút bài làm của user từ DB
            detail_res = supabase.table("detailed_results").select("*, test_history!inner(test_id)").eq("id", detail_id).execute()
            if not detail_res.data:
                raise HTTPException(status_code=404, detail="Không tìm thấy bài làm")
                
            ans = detail_res.data[0]
            test_id = ans["test_history"]["test_id"]
            
            # 2. Rút câu hỏi gốc
            q_res = supabase.table("test_questions").select("question_bank(skill, content)").eq("test_id", test_id).eq("order_idx", ans["question_index"]).execute()
            original_q = q_res.data[0]["question_bank"]["content"].get("text", "")
            skill = q_res.data[0]["question_bank"]["skill"]

            # 3. Khởi tạo AI
            ai_service = GeminiService(api_key=api_key)
            ai_feedback = None

            # 4. Phân luồng chấm điểm
            if skill == "writing":
                user_text = ans.get("user_answer_text", "")
                if len(user_text.split()) < 10:
                     ai_feedback = {"total_score": 0, "grammar_mistakes": [], "suggested_vocab": [], "note": "Bài quá ngắn để chấm."}
                else:
                     ai_feedback = ai_service.grade_writing(original_q, user_text)

            elif skill == "speaking":
                audio_url = ans.get("user_audio_url")
                if not audio_url:
                    ai_feedback = {"total_score": 0, "grammar_mistakes": [], "suggested_vocab": [], "note": "Không có file âm thanh."}
                else:
                    try:
                        # 1. Trích xuất đường dẫn file (path) từ URL gốc
                        # URL có dạng: .../speaking_records/user_id/history_id/file.webm
                        # Ta cắt chuỗi để lấy phần đuôi sau tên bucket
                        file_path = audio_url.split("speaking_records/")[-1]
                        
                        # 2. Dùng Supabase Client tải thẳng file về dạng bytes
                        audio_bytes = supabase.storage.from_("speaking_records").download(file_path)
                        
                        # 3. Quăng cho Gemini chấm
                        ai_feedback = ai_service.grade_speaking(original_q, audio_bytes)
                        
                    except Exception as e:
                        print(f"❌ CHI TIẾT LỖI TẢI AUDIO: {repr(e)}")
                        raise ValueError("Không thể tải file âm thanh từ hệ thống lưu trữ.")
            
            # 5. Cập nhật kết quả vào DB
            supabase.table("detailed_results").update({"ai_feedback": ai_feedback}).eq("id", detail_id).execute()

            return ai_feedback

        except Exception as e:
            print(f"❌ LỖI GRADING SERVICE: {repr(e)}")
            raise HTTPException(status_code=500, detail="Lỗi hệ thống khi AI chấm bài")