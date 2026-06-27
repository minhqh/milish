import json
from pathlib import Path
from app.services.supabase_client import supabase

# Trỏ đường dẫn tới thư mục chứa các file json (backend/scripts/data)
DATA_DIR = Path(__file__).parent / "data"

def load_json_files():
    """Đọc toàn bộ file .json trong thư mục data và gom lại thành một list duy nhất."""
    all_questions = []
    if not DATA_DIR.exists():
        print(f"❌ Không tìm thấy thư mục: {DATA_DIR}")
        return all_questions

    for json_file in DATA_DIR.glob("*.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if isinstance(data, list):
                    all_questions.extend(data)
                else:
                    print(f"⚠️ Cảnh báo: File {json_file.name} không phải là một danh sách JSON hợp lệ.")
            except json.JSONDecodeError as e:
                print(f"❌ Lỗi cú pháp JSON ở file {json_file.name}: {e}")
                
    return all_questions

def seed_database():
    print("🚀 Bắt đầu đọc dữ liệu từ các file JSON...")
    questions = load_json_files()
    
    if not questions:
        print("📭 Không có dữ liệu để nạp. Hãy kiểm tra lại thư mục data/.")
        return

    print(f"📦 Tìm thấy tổng cộng {len(questions)} câu hỏi. Đang tiến hành nạp vào Supabase...")
    
    for q in questions:
        if "test_code" in q:
            del q["test_code"]
            
    try:
        # Supabase Python SDK hỗ trợ chèn một list các dicts cùng lúc (Batch Insert)
        # Điều này nhanh hơn rất nhiều so với việc lặp qua từng câu
        response = supabase.table("question_bank").insert(questions).execute()
        
        # Nếu không có lỗi văng ra (Exception), việc nạp đã thành công
        print(f"🎉 Hoàn tất! Đã nạp thành công {len(response.data)} câu hỏi vào DB.")
        
    except Exception as e:
         print(f"❌ Lỗi nghiêm trọng khi nạp dữ liệu vào database: {repr(e)}")

if __name__ == "__main__":
    seed_database()