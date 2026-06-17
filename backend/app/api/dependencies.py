import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SUPABASE_JWT_KEY = os.getenv("SUPABASE_JWT_SECRET")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Hàm này dùng để bảo vệ các Endpoint. 
    Nó giải mã JWT, kiểm tra tính hợp lệ và trả về user_id.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )

        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không chưa thông tin User ID hợp lệ"
            )
        
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token đã hết hạn, vui lòng đăng nhập lại"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token không hợp lệ hoặc đã bị chỉnh sửa"
        )