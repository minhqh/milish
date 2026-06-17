from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest, VerifyOTPRequest, LoginRequest
from app.services.auth_service import register_supabase_user, verify_supabase_otp, login_supabase_user

router = APIRouter()

@router.post("/register")
async def register(req: RegisterRequest):
    try:
        register_supabase_user(req.email, req.password, req.full_name)
        return {"status": "success", "message": "Vui lòng kiểm tra email để lấy mã OTP"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    try:
        res = verify_supabase_otp(req.email, req.otp)
        return {
            "status": "success", 
            "user_id": res.user.id, 
            "access_token": res.session.access_token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="OTP không hợp lệ!")

@router.post("/login")
async def login(req: LoginRequest):
    try:
        res = login_supabase_user(req.email, req.password)
        return {
            "status": "success",
            "user_id": res.user.id,
            "access_token": res.session.access_token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Sai email hoặc mật khẩu!")