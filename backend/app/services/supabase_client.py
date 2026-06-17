import os
from httpx import Client
from supabase import create_client, client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Thiếu cấu hình supabase key hoặc url")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
