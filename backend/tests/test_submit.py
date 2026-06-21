from unittest.mock import patch
from fastapi import HTTPException

def test_submit_test_success(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Payload giả lập user nộp bài có file ghi âm
    payload = {
        "test_id": "test-uuid-1234",
        "answers": [
            {
                "question_id": "question-uuid-5678",
                "order_idx": 1,
                "skill": "speaking",
                # Base64 ảo, siêu ngắn để test chạy cực nhanh
                "audio_base64": "data:audio/webm;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
            }
        ]
    }
    
    # MOCK: Chặn gọi Service thật, giả lập việc nộp bài thành công và nhả ra history_id
    with patch("app.api.endpoints.test_router.TestService.submit_test", return_value="history-id-9999"):
        res = client.post("/api/tests/submit", json=payload, headers=headers)
        
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["data"]["history_id"] == "history-id-9999"

def test_submit_test_database_error(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {
        "test_id": "test-uuid-1234",
        "answers": []
    }
    
    # MOCK: Giả lập Database chết đột ngột hoặc Cloud Storage từ chối upload file
    with patch("app.api.endpoints.test_router.TestService.submit_test") as mock_sub:
        mock_sub.side_effect = HTTPException(status_code=500, detail="Lỗi khi lưu bài thi")
        
        res = client.post("/api/tests/submit", json=payload, headers=headers)
        
        assert res.status_code == 500
        assert "Lỗi khi lưu bài thi" in res.json()["detail"]