from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- Base Configuration ---
# This ensures that 'crop_name' in Python maps to 'cropName' in JS automatically
# both for receiving and sending data.
class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=lambda s: ''.join(w.capitalize() if i > 0 else w for i, w in enumerate(s.split('_')))
    )

# --- Authentication Schemas ---

class UserBase(BaseSchema):
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

class UserUpdate(BaseSchema):
    name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    avatar: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserResponse

# --- Climate Schemas ---

class IMDAlert(BaseSchema):
    id: str
    type: str
    severity: str
    source: str = "IMD"
    description: str
    valid_until: Optional[str] = None

class ClimateAlert(BaseSchema):
    id: str
    type: str
    severity: str
    location: str
    time: str
    description: str
    advice: str
    source: Optional[str] = "FarmVista AI"

class WeatherForecast(BaseSchema):
    day: str
    temp: str
    condition: str

class ClimateData(BaseSchema):
    temperature: float
    rainfall: float
    rain_chance: float = 0
    humidity: float
    wind_speed: float
    location: str = "Madurai, TN"
    sources_used: Optional[List[str]] = ["Open-Meteo"]
    confidence_score: Optional[int] = 75
    source_agreement: Optional[str] = "Moderate"
    imd_alerts: Optional[List[Any]] = []

# --- Crop Recommendation Schemas ---

class CropRecommendationItem(BaseSchema):
    crop_name: str
    crop_name_ta: Optional[str] = None
    category: str
    icon: str
    suitability_score: int
    risk_level: str
    planting_window: str
    planting_window_ta: Optional[str] = None
    reason: str
    reason_ta: Optional[str] = None
    water_need: str
    ideal_soil: str
    duration_days: str

class CropRecommendationResponse(BaseSchema):
    location: str
    season: str
    soil_type_used: str
    weather_summary: Dict[str, Any]
    recommendations: List[CropRecommendationItem]

# --- Crop Management Schemas ---

class CropBase(BaseSchema):
    crop_name: str
    quantity: str
    price_per_kg: float
    cultivate_date: str
    harvest_date: str
    location: str
    description: Optional[str] = None

class CropCreate(CropBase):
    blockchain_tx_hash: Optional[str] = None
    ipfs_hash: Optional[str] = None

class CropStatusUpdate(BaseSchema):
    status: str

class CropJourneyUpdate(BaseSchema):
    stage: str
    grade: Optional[str] = None

class CropEventBase(BaseSchema):
    activity: str
    event_date: str
    description: str
    quantity: Optional[str] = None

class CropEventCreate(CropEventBase):
    pass

class CropEventResponse(CropEventBase):
    id: int
    crop_id: int
    farmer_id: int
    photo_url: Optional[str] = None
    created_at: datetime

class CropResponse(CropBase):
    id: int
    farmer_id: int
    status: str
    risk_level: str
    blockchain_tx_hash: Optional[str] = None
    blockchain_status: Optional[str] = "pending"
    ipfs_hash: Optional[str] = None
    stage: Optional[str] = "Cultivation"
    grade: Optional[str] = None
    created_at: datetime
    events: Optional[List[CropEventResponse]] = []

# --- Dashboard & Other Schemas ---

class DashboardSummary(BaseSchema):
    active_crops: int
    revenue: str
    alerts: int

class FactorDetail(BaseSchema):
    name: str
    impact: str
    description: str
    description_ta: Optional[str] = None

class PricePrediction(BaseSchema):
    sell_today: float
    wait_3_days: float
    potential_gain: float
    action: Optional[str] = "WAIT"
    confidence_score: Optional[int] = 85
    crop_name: Optional[str] = None
    recommendation_text: Optional[str] = None
    recommendation_text_ta: Optional[str] = None
    factors: Optional[List[FactorDetail]] = None

class RetailerDashboardSummary(BaseSchema):
    total_spend: str
    inventory_value: str
    avg_margin: str
    active_purchases: int

class PaymentConfirmRequest(BaseSchema):
    crop_id: int
    total_amount: float
    base_cost: float
    transport_estimate: float
    platform_fee: float

class PurchaseResponse(BaseSchema):
    id: int
    tx_hash: str
    crop_name: str
    quantity: str
    farmer_name: str
    total_paid: float
    status: str
    date: str

class MarketplaceCrop(BaseSchema):
    id: int
    crop_name: str
    quantity: str
    price: float
    location: str
    risk_level: str
    status: str
    verified: bool

class AssistantMessage(BaseSchema):
    message: str
    language: str = "en"


# --- Phase 2: AI Direct Buyer Matching Schemas ---

class BuyerDemandCreate(BaseSchema):
    buyer_category: str  # Supermarkets, Restaurants & Hotels, Food-Processing, Exporters, Local Retailers, Government/Institutional
    crop_name: str
    target_quantity_kg: float
    max_price_per_kg: float
    frequency: str = "One-Time"  # One-Time, Weekly, Bi-Weekly, Monthly
    delivery_location: str
    delivery_district: Optional[str] = None
    delivery_deadline: Optional[str] = None
    notes: Optional[str] = None


class BuyerDemandResponse(BaseSchema):
    id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_category: str
    crop_name: str
    target_quantity_kg: float
    max_price_per_kg: float
    frequency: str
    delivery_location: str
    delivery_district: Optional[str] = None
    delivery_deadline: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime


class FarmerSupplyPoolCreate(BaseSchema):
    crop_id: Optional[int] = None
    crop_name: str
    available_quantity_kg: float
    min_price_per_kg: float
    location: str
    district: Optional[str] = None
    state: Optional[str] = None
    harvest_date: Optional[str] = None
    quality_grade: str = "A"


class FarmerSupplyPoolResponse(BaseSchema):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    crop_id: Optional[int] = None
    crop_name: str
    available_quantity_kg: float
    min_price_per_kg: float
    location: str
    district: Optional[str] = None
    state: Optional[str] = None
    harvest_date: Optional[str] = None
    quality_grade: str
    status: str
    created_at: datetime


class FarmerAllocationItem(BaseSchema):
    farmer_id: int
    farmer_name: str
    phone: Optional[str] = None
    district: Optional[str] = None
    allocated_kg: float
    payout_amount: float
    status: str = "Matched"


class AggregatedContractResponse(BaseSchema):
    id: int
    demand_id: int
    buyer_id: int
    buyer_name: str
    buyer_category: str
    crop_name: str
    total_quantity_kg: float
    agreed_price_per_kg: float
    total_contract_value: float
    delivery_location: str
    delivery_deadline: Optional[str] = None
    status: str
    farmer_allocations: List[FarmerAllocationItem]
    blockchain_contract_tx: Optional[str] = None
    created_at: datetime

