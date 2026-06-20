import random
import uuid
import base64
from datetime import datetime
from fastapi import HTTPException
from app.services.supabase_client import supabase
from app.services.storage_service import upload_audio_to_supabase
from app.schemas.test import GenerateTestRequest, TestSubmitRequest

class TestService:
    @staticmethod
    def generate_custom_test(request: GenerateTestRequest, user_id: str) -> str:
        try:
            query = supabase.table("question_bank").select("id")

            if request.skills:
                query = query.in_("skill", request.skills)
            if request.topics:
                query = query.in_("topic", request.topics)

            res = query.execute()
            matching_questions = res.data

            if not matching_questions:
                raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi nào phù hợp với bộ lọc của bạn.")
            
            selected_count = min(request.question_count, len(matching_questions))
            selected_questions = random.sample(matching_questions, selected_count)
            
            current_time = datetime.now().strftime('%d/%m/%Y %H:%M')
            new_test_res = supabase.table("tests").insert({
                "name": f"Custom Practice - {current_time}",
                "is_static": False,
                "created_by": user_id,
                "duration": f"Khoảng {selected_count * 2} phút"
            }).execute()
            
            new_test_id = new_test_res.data[0]["id"]
            
            test_questions_data = [
                {
                    "test_id": new_test_id,
                    "question_id": q["id"],
                    "order_idx": idx + 1
                }
                for idx, q in enumerate(selected_questions)
            ]
                
            supabase.table("test_questions").insert(test_questions_data).execute()
            
            return new_test_id
            
        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"❌ LỖI TẠO ĐỀ CUSTOM (Service): {repr(e)}")
            raise HTTPException(status_code=500, detail="Đã xảy ra lỗi khi tạo đề thi")
    
    @staticmethod
    def submit_test(request: TestSubmitRequest, user_id: str) -> str:
        try:
            history_id =  str(uuid.uuid4())
            history_data = {
                "id": history_id,
                "test_id": request.test_id,
                "user_id": user_id,
                "session_id": f"session_{int(datetime.now().timestamp())}"
            }

            detailed_results_data = []

            for ans in request.answers:
                audio_url = None

                if ans.audio_base64:
                    base64_data = ans.audio_base64
                    if "," in base64_data:
                        base64_data = base64_data.split(",")[1]

                    audio_bytes = base64.b64decode(base64_data)
                    
                    filename = f"{user_id}/{history_id}/{ans.question_id}.webm"

                    audio_url = upload_audio_to_supabase(
                        audio_bytes=audio_bytes, 
                        filename=filename, 
                        content_type="audio/webm"
                    )
                detailed_results_data.append({
                    "history_id": history_id,
                    "question_index": ans.order_idx,
                    "user_answer_text": ans.answer_text, # Sẽ có giá trị nếu là bài Writing
                    "user_audio_url": audio_url          # Sẽ có link nếu là bài Speaking
                })

            if detailed_results_data:
                supabase.table("detailed_results").insert(detailed_results_data)

            return history_id

        except Exception as e:
            print(f"❌ LỖI NỘP BÀI (Service): {repr(e)}")
            raise HTTPException(status_code=500, detail="Đã xảy ra lỗi khi lưu bài thi")
        