from unittest.mock import MagicMock, patch

def test_register_success(client, test_user):
    # MOCK: Giả lập đăng ký thành công
    with patch("app.api.endpoints.auth.register_supabase_user") as mock_reg:
        mock_res = MagicMock()
        mock_res.user.id = "new-user-123"
        mock_res.session.access_token = "new-token-123"
        mock_reg.return_value = mock_res
        
        # MOCK: Chặn luôn việc gửi email ngầm để test chạy lướt qua nhanh
        with patch("app.api.endpoints.auth.send_welcome_email_task"):
            res = client.post("/api/auth/register", json=test_user)
            
            assert res.status_code == 200
            assert res.json()["status"] == "success"

def test_register_duplicate(client, test_user):
    # MOCK: Giả lập Supabase ném lỗi trùng email
    with patch("app.api.endpoints.auth.register_supabase_user") as mock_reg:
        mock_reg.side_effect = Exception("User already registered")
        
        res = client.post("/api/auth/register", json=test_user)
        
        assert res.status_code == 400
        assert "đã được sử dụng" in res.json()["detail"]

def test_login_success(client, test_user):
    # MOCK: Giả lập đăng nhập đúng
    with patch("app.api.endpoints.auth.login_supabase_user") as mock_login:
        mock_res = MagicMock()
        mock_res.user.id = "mock-user-123"
        mock_res.session.access_token = "mock-jwt-token"
        mock_login.return_value = mock_res
        
        res = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        
        assert res.status_code == 200
        assert "access_token" in res.json()