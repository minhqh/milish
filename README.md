# Cấu trúc thư mục

``` Folder
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Điểm khởi chạy của FastAPI
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py     # Nơi check API Key người dùng gửi lên
│   │   └── endpoints/
│   │       ├── speaking.py     # Router nhận file ghi âm
│   │       └── writing.py      # Router nhận text
│   ├── core/
│   │   └── config.py           # Xử lý biến môi trường
│   ├── schemas/                # Pydantic models (validate dữ liệu vào/ra)
│   │   └── grading_models.py   
│   └── services/
│       ├── gemini_client.py    # Logic giao tiếp với Google GenAI SDK
│       └── supabase_client.py  # Logic upload file âm thanh lấy URL
├── .env                        # Chứa SUPABASE_URL, không chứa Gemini Key
├── requirements.txt            # fastapi, uvicorn, google-generativeai, supabase
├── Dockerfile
└── docker-compose.yml
```
