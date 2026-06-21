from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="Định dạng email không hợp lệ")
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str