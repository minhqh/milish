from pydantic import BaseModel

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str