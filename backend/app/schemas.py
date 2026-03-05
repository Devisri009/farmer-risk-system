from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    role: str
    name: str
    username: str
    phone: str
    government_id_type: str
    government_id_number: str
    state: str
    district: str
    taluk: str
    village: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    role: str
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

class CropBase(BaseModel):
    cropName: str
    quantity: str
    pricePerKg: float
    cultivateDate: str
    harvestDate: str
    location: str
    description: Optional[str] = None

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    id: int
    farmer_id: int
    status: str
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    activeCrops: int
    revenue: str
    alerts: int

class ClimateData(BaseModel):
    temp: int
    rainProb: int
    humidity: int
    windSpeed: int

class PricePrediction(BaseModel):
    sellToday: int
    wait3Days: int
    potentialGain: int
