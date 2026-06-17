import uuid
import time
from fastapi import UploadFile, HTTPException

def validate_audio_file(file: UploadFile):
    """Kiểm tra định dạng file có phải là audio không."""
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

def generate_unique_filename(user_id: str, original_filename: str) -> str:
    """Tạo tên file độc nhất dựa trên user_id, uuid và timestamp."""
    file_ext = original_filename.split('.')[-1] if '.' in original_filename else 'webm'
    return f"record_{user_id}_{uuid.uuid4().hex[:8]}_{int(time.time())}.{file_ext}"