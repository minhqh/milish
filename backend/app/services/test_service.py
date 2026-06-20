import random
from datetime import datetime
from fastapi import HTTPException
from app.services.supabase_client import supabase
from app.schemas.request import GenerateTestRequest

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
        