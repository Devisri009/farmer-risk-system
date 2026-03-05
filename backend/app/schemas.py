from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ClimateAlert(BaseModel):
    id: str
    type: str
    severity: str
    location: str
    time: str
    description: str
    advice: str

class WeatherForecast(BaseModel):
    day: str
    temp: str
    condition: str
