import os
import json
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()
security = HTTPBearer()

jwks_string = os.getenv("SUPABASE_JWKS")
try:
    JWKS_DATA = json.loads(jwks_string) if jwks_string else {"keys": []}
except json.JSONDecodeError:
    print("❌ LỖI: Biến SUPABASE_JWKS trong .env không phải là JSON hợp lệ!")
    JWKS_DATA = {"keys": []}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # 1. Trích xuất header của token để lấy 'kid' (Key ID) mà không cần giải mã
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # 2. Tìm key có 'kid' khớp với token trong danh sách JWKS của chúng ta
        key_dict = next((k for k in JWKS_DATA.get("keys", []) if k.get("kid") == kid), None)
        
        if not key_dict:
            raise Exception(f"Không tìm thấy Public Key (kid: {kid}) trong biến môi trường")
        
        # 3. Tạo Signing Key từ dict và giải mã
        signing_key = jwt.PyJWK(key_dict)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            options={"verify_aud": False}
        )
        
        return payload.get("sub")
        
    except Exception as e:
        print(f"❌ LỖI GIẢI MÃ: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token không hợp lệ hoặc đã hết hạn"
        )