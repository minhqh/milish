from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase_client import supabase
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/{test_id}")
async def get_test(test_id: str, user_id: str = Depends(get_current_user)):
    try:
        response = supabase.table("tests").select("*").eq("id", test_id).execute()
    except Exception as e:
        print(f"❌ LỖI KẾT NỐI DATABASE: {repr(e)}")
        raise HTTPException(status_code=500, detail="Lỗi máy chủ cơ sở dữ liệu")

    # 2. Logic kiểm tra xem có đề hay không đặt ở NGOÀI khối try...except
    if not response.data:
        # Nếu không có data, quăng lỗi 404 và FastAPI sẽ trả đúng 404 về Frontend
        raise HTTPException(status_code=404, detail="Test not found")
    
    return {"status": "success", "data": response.data[0]}