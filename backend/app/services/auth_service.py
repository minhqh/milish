from app.services.supabase_client import supabase
import asyncio

def register_supabase_user(email: str, password: str, full_name: str):
    return supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {"data": {"full_name": full_name}}
    })

def login_supabase_user(email: str, password: str):
    return supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })

async def send_welcome_email_task(email: str, full_name: str):
    await asyncio.sleep(2)
    print(f"📧 [EMAIL SENT] Đã gửi thư chào mừng tới {full_name} ({email})!")