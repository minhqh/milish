from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_supabase_user, login_supabase_user, send_welcome_email_task

router = APIRouter()

@router.post("/register")
def register(req: RegisterRequest, background_tasks: BackgroundTasks):
    try:
        res = register_supabase_user(req.email, req.password, req.full_name)

        background_tasks.add_task(send_welcome_email_task, req.email, req.full_name)

        return {
            "status": "success", 
            "message": "Đăng ký thành công!",
            "user_id": res.user.id,
            "access_token": res.session.access_token
        }
    except Exception as e:
        error_msg = str(e)
        if "User already registered" in error_msg:
            raise HTTPException(status_code=400, detail="Email này đã được sử dụng. Vui lòng đăng nhập!")
        raise HTTPException(status_code=400, detail=error_msg)

@router.post("/login")
def login(req: LoginRequest):
    try:
        res = login_supabase_user(req.email, req.password)
        return {
            "status": "success",
            "user_id": res.user.id,
            "access_token": res.session.access_token
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Sai email hoặc mật khẩu!")