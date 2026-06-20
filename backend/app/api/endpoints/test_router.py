from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase_client import supabase
from app.api.dependencies import get_current_user

# Import Schema và Service mà chúng ta vừa tái cấu trúc
from app.schemas.request import GenerateTestRequest
from app.services.test_service import TestService

router = APIRouter()

# ==========================================
# 1. API TEST HUB: Lấy tất cả bộ đề (Nằm trên cùng)
# ==========================================
@router.get("/collections/all")
async def get_all_collections(user_id: str = Depends(get_current_user)):
    try:
        response = supabase.table("collections") \
            .select("id, title, description, tags, tests(id, name, duration)") \
            .execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"❌ LỖI TRUY VẤN TEST HUB: {repr(e)}")
        raise HTTPException(status_code=500, detail="Lỗi lấy danh sách bộ đề")

# ==========================================
# 2. API TẠO ĐỀ: Sinh đề động theo ý muốn
# ==========================================
@router.post("/generate")
async def generate_custom_test(request: GenerateTestRequest, user_id: str = Depends(get_current_user)):
    # Phủi tay giao hết logic cho TestService xử lý, router chỉ lo nhận-trả
    new_test_id = TestService.generate_custom_test(request, user_id)
    return {"status": "success", "data": {"test_id": new_test_id}}

# ==========================================
# 3. API CHI TIẾT: Lấy nội dung 1 bài thi (Nằm dưới cùng)
# ==========================================
@router.get("/{test_id}")
async def get_test(test_id: str, user_id: str = Depends(get_current_user)):
    try:
        test_res = supabase.table("tests").select("*").eq("id", test_id).execute()
    except Exception as e:
        print(f"❌ LỖI TRUY VẤN VỎ ĐỀ THI: {repr(e)}")
        raise HTTPException(status_code=500, detail="Lỗi kết nối CSDL khi lấy đề thi")

    if not test_res.data:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test_info = test_res.data[0]
    
    try:
        # Cú pháp select của Supabase để Join bảng: lấy order_idx và toàn bộ data của question_bank
        questions_res = supabase.table("test_questions") \
            .select("order_idx, question_bank(*)") \
            .eq("test_id", test_id) \
            .order("order_idx") \
            .execute()
    except Exception as e:
        print(f"❌ LỖI TRUY VẤN CÂU HỎI: {repr(e)}")
        raise HTTPException(status_code=500, detail="Lỗi kết nối CSDL khi lấy câu hỏi")

    # Định dạng lại cấu trúc trả về cho Frontend dễ xài
    formatted_questions = []
    for item in questions_res.data:
        qb_data = item.get("question_bank")
        if qb_data:
            # Bung cái JSONB 'content' ra và gộp chung với metadata của câu hỏi
            question_detail = {
                "question_id": qb_data.get("id"),
                "skill": qb_data.get("skill"),
                "part_type": qb_data.get("part_type"),
                "order_idx": item.get("order_idx"),
                **qb_data.get("content", {}) # Trải phẳng dữ liệu JSONB vào object này
            }
            formatted_questions.append(question_detail)

    # Gắn mảng câu hỏi vừa format vào thông tin bài thi
    test_info["questions"] = formatted_questions

    return {"status": "success", "data": test_info}