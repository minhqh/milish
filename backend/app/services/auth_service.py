from app.services.supabase_client import supabase

def register_supabase_user(email: str, password: str, full_name: str):
    return supabase.auth.sign_up({
        "email": email,
        "password": password,
        "options": {"data": {"full_name": full_name}}
    })

def verify_supabase_otp(email: str, otp: str):
    return supabase.auth.verify_otp({
        "email": email,
        "token": otp,
        "type": "signup"
    })

def login_supabase_user(email: str, password: str):
    return supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })