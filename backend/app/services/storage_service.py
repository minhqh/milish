from app.services.supabase_client import supabase

def upload_audio_to_supabase(audio_bytes: bytes, filename: str, content_type: str) -> str:
    """Lưu file lên Supabase và trả về public URL[cite: 2]."""
    supabase.storage.from_("speaking_records").upload(
        file=audio_bytes,
        path=filename,
        file_options={"content-type": content_type}
    )
    return supabase.storage.from_("speaking_records").get_public_url(filename)