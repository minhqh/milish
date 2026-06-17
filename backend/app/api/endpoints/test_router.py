from fastapi import APIRouter, HTTPException, Depends
from app.services.supabase_client import supabase
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/{test_id}")
async def get_test(test_id: str, user_id: str = Depends(get_current_user)):
    try:
        response = supabase.table("tests").select("*").eq("id", test_id).execute()
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Test not found")
        
        return {"status": "success", "data": response.data[0]}
    except Exception as e:
        print(f"❌ LỖI TRUY VẤN DATABASE: {repr(e)}")
        raise HTTPException(status_code=500, detail=str(e))