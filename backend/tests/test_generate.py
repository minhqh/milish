from unittest.mock import patch
from fastapi import HTTPException

def test_generate_custom_test_success(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"skills": ["speaking"], "topics": ["Daily Life"], "question_count": 1}
    
    # MOCK: Bắt Service trả về 1 ID đề thi ảo, không chọc xuống Database
    with patch("app.api.endpoints.test_router.TestService.generate_custom_test", return_value="mock-test-id-999"):
        res = client.post("/api/tests/generate", json=payload, headers=headers)
        
        # ASSERT DETERMINISTIC: Bắt buộc phải là 200
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["data"]["test_id"] == "mock-test-id-999"

def test_generate_custom_test_empty_db(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"skills": ["alien_skill"], "topics": ["Alien Topic"], "question_count": 1}
    
    # MOCK: Ép Service văng lỗi hệt như khi DB không tìm thấy câu hỏi
    with patch("app.api.endpoints.test_router.TestService.generate_custom_test") as mock_gen:
        mock_gen.side_effect = HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
        
        res = client.post("/api/tests/generate", json=payload, headers=headers)
        
        # ASSERT DETERMINISTIC: Bắt buộc phải là 404
        assert res.status_code == 404
        assert "Không tìm thấy câu hỏi" in res.json()["detail"]