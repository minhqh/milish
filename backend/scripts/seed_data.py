import asyncio
from app.services.supabase_client import supabase

# Dữ liệu mẫu bám sát format TOEIC thực tế
SAMPLE_QUESTIONS = [
    # --- TOEIC SPEAKING ---
    {
        "skill": "speaking",
        "part_type": "read_aloud",
        "topic": "Daily Life",
        "content": {
            "text": "Attention all passengers waiting for flight 822 to Tokyo. The departure gate has been changed to gate 45. Please have your boarding passes ready.",
            "prep_time": 45,
            "resp_time": 45
        }
    },
    {
        "skill": "speaking",
        "part_type": "describe_picture",
        "topic": "Workplace",
        "content": {
            "text": "Describe the picture on your screen in as much detail as you can.",
            "image_url": "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
            "prep_time": 45,
            "resp_time": 30
        }
    },
    # --- TOEIC WRITING ---
    {
        "skill": "writing",
        "part_type": "write_essay",
        "topic": "Technology",
        "content": {
            "text": "Some people believe that technology has made our lives too complex and that we should live a simpler life without it. To what extent do you agree or disagree? Give specific reasons or examples to support your opinion.",
            "prep_time": 0,
            "resp_time": 1800 # 30 phút
        }
    },
    {
        "skill": "writing",
        "part_type": "respond_to_email",
        "topic": "Workplace",
        "content": {
            "text": "From: HR Department\nTo: All Employees\nSubject: Annual Team Building Event\n\nWe are planning the annual team-building event for next month. We would like your suggestions on activities and locations.\n\nDirections: Respond to the email. In your email, give AT LEAST TWO suggestions for activities and ONE suggestion for a location.",
            "prep_time": 0,
            "resp_time": 600 # 10 phút
        }
    }
]

def seed_database():
    print("🚀 Bắt đầu nạp dữ liệu vào question_bank...")
    
    success_count = 0
    for q in SAMPLE_QUESTIONS:
        try:
            # Ghi vào Supabase
            supabase.table("question_bank").insert(q).execute()
            success_count += 1
            print(f"✅ Đã nạp: [{q['skill'].upper()}] - {q['part_type']}")
        except Exception as e:
            print(f"❌ Lỗi khi nạp câu hỏi: {repr(e)}")
            
    print(f"🎉 Hoàn tất! Nạp thành công {success_count}/{len(SAMPLE_QUESTIONS)} câu hỏi.")

if __name__ == "__main__":
    seed_database()

# python -m scripts.seed_data