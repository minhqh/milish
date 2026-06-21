import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Thiếu cấu hình supabase key hoặc url")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_fresh_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)
