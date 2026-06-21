import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import uuid

# Cập nhật đường dẫn import app cho đúng với dự án của cậu
from app.api.dependencies import get_current_user
from app.main import app 

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def test_user():
    return {
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "password": "StrongPassword123!",
        "full_name": "Test User"
    }

@pytest.fixture(scope="session")
def auth_token(client, test_user):
    """Fixture cấp token an toàn tuyệt đối, có check fail"""
    
    # MOCK: Giả lập Supabase trả về login thành công
    with patch("app.api.endpoints.auth.login_supabase_user") as mock_login:
        mock_res = MagicMock()
        mock_res.user.id = "mock-user-123"
        mock_res.session.access_token = "mock-jwt-token-xyz"
        mock_login.return_value = mock_res
        
        res = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        
        # ĐIỂM CẢI THIỆN SỐ 3: Bắt lỗi ngay tại Fixture
        assert res.status_code == 200, f"Setup Fixture Lỗi: Không thể login - {res.text}"
        assert "access_token" in res.json(), "Setup Fixture Lỗi: JSON không chứa access_token"
        
        return res.json()["access_token"]
    
@pytest.fixture(scope="session", autouse=True)
def override_auth_dependency():
    """
    Fixture này có autouse=True, nó sẽ tự động chạy trước MỌI bài test.
    Nó báo cho FastAPI biết: Hễ chỗ nào dùng Depends(get_current_user), 
    đừng giải mã Token nữa, cứ auto cho qua và gán user_id = "mock-user-123".
    """
    app.dependency_overrides[get_current_user] = lambda: "mock-user-123"
    yield
    app.dependency_overrides = {} # Dọn dẹp sau khi test xong