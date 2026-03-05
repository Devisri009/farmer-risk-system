import re
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FarmVista API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],  # Explicit origins for credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_mock_coordinates(district: str):
    # In a real app, use a Geocoding API (e.g. Google Maps or OpenStreetMap) 
    # to convert the user's entered location into coordinates.
    # For now, we only have coordinates for some known districts.
    locations = {
        "madurai": (9.925, 78.119),
        "chennai": (13.0827, 80.2707),
        "coimbatore": (11.0168, 76.9558),
        "salem": (11.6643, 78.1460),
        "tiruchirappalli": (10.7905, 78.7047),
    }
    return locations.get(district.lower(), (None, None))

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if phone exists
    if db.query(models.User).filter(models.User.phone == user.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Check if government ID exists
    if db.query(models.User).filter(models.User.government_id_number == user.government_id_number).first():
        raise HTTPException(status_code=400, detail="Government ID number already registered")

    # Validate Government ID format
    id_type = user.government_id_type
    id_num = user.government_id_number.strip()
    
    if id_type == "Aadhaar Number":
        if not re.match(r"^\d{12}$", id_num):
            raise HTTPException(status_code=400, detail="Aadhaar must be 12 digits")
    elif id_type == "PAN Number":
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", id_num):
            raise HTTPException(status_code=400, detail="PAN must be 5 letters, 4 numbers, 1 letter")
    elif id_type == "Voter ID":
        if not re.match(r"^[A-Z]{3}[0-9]{7}$", id_num):
            raise HTTPException(status_code=400, detail="Voter ID must be 3 letters and 7 numbers")
    
    hashed_password = auth.get_password_hash(user.password)
    
    # Get mock coordinates based on district
    lat, lng = get_mock_coordinates(user.district)
    
    db_user = models.User(
        role=user.role,
        name=user.name,
        username=user.username,
        phone=user.phone,
        password_hash=hashed_password,
        government_id_type=user.government_id_type,
        government_id_number=user.government_id_number,
        state=user.state,
        district=user.district,
        taluk=user.taluk,
        village=user.village,
        latitude=lat,
        longitude=lng
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # Allow login with either username OR phone number
    login_id = user_credentials.username.strip().lower()
    print(f"DEBUG: Login attempt for ID: '{login_id}'")
    
    user = db.query(models.User).filter(
        (models.User.username == login_id) | 
        (models.User.phone == login_id)
    ).first()
    
    if not user:
        print(f"DEBUG: User not found for ID '{login_id}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (User not found)"
        )
        
    is_valid = auth.verify_password(user_credentials.password, user.password_hash)
    print(f"DEBUG: Password verification for '{login_id}': {'SUCCESS' if is_valid else 'FAILED'}")
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials (Password mismatch)"
        )

    
    access_token = auth.create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "role": user.role,
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "role": user.role
        }
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to FarmVista API"}

# --- Crop Management ---

@app.post("/api/crops", response_model=schemas.CropResponse)
def post_crop(
    crop: schemas.CropCreate = Depends(), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # In a real app with file uploads, you'd use UploadFile
    # For now, we'll handle the form data
    db_crop = models.Crop(
        farmer_id=current_user.id,
        crop_name=crop.cropName,
        quantity=crop.quantity,
        price_per_kg=crop.pricePerKg,
        cultivate_date=crop.cultivateDate,
        harvest_date=crop.harvestDate,
        location=crop.location,
        description=crop.description,
        status="Active",
        risk_level="Low"
    )
    db.add(db_crop)
    db.commit()
    db.refresh(db_crop)
    return db_crop

@app.get("/api/farmer/batches", response_model=list[schemas.CropResponse])
def get_farmer_batches(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()

@app.get("/api/farmer/batches/{batch_id}", response_model=schemas.CropResponse)
def get_batch_by_id(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    batch = db.query(models.Crop).filter(
        models.Crop.id == batch_id, 
        models.Crop.farmer_id == current_user.id
    ).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

# --- Dashboard & Climate ---

@app.get("/api/dashboard/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Mock summary data
    active_count = db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id,
        models.Crop.status == "Active"
    ).count()
    
    return {
        "activeCrops": active_count,
        "revenue": "45,000",
        "alerts": 2
    }

@app.get("/api/climate", response_model=schemas.ClimateData)
def get_climate_data():
    return {
        "temp": 32,
        "rainProb": 80,
        "humidity": 75,
        "windSpeed": 12
    }

@app.get("/api/climate/risk")
def get_climate_risk(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "location": current_user.district or "Madurai",
        "risks": [
            { "crop": "Rice", "risk": "Low" },
            { "crop": "Corn", "risk": "Moderate" },
            { "crop": "Tomato", "risk": "High" }
        ]
    }

@app.get("/api/price-prediction", response_model=schemas.PricePrediction)
def get_price_prediction():
    return {
        "sellToday": 20000,
        "wait3Days": 24000,
        "potentialGain": 4000
    }

@app.get("/api/climate/alerts", response_model=list[schemas.ClimateAlert])
def get_climate_alerts():
    # In a real app, this would fetch from a weather API or a database of alerts
    return [
        {
            "id": "1",
            "type": "Heavy Rain Warning",
            "severity": "High",
            "location": "Madurai Region",
            "time": "2 hours ago",
            "description": "Expect heavy rainfall over the next 48 hours. Risk of flooding in low-lying areas.",
            "advice": "Ensure proper drainage in fields. Postpone any fertilizer application."
        },
        {
            "id": "2",
            "type": "Heat Wave",
            "severity": "Medium",
            "location": "Tamil Nadu Central",
            "time": "5 hours ago",
            "description": "Temperatures expected to rise 3-4°C above normal.",
            "advice": "Increase irrigation frequency. Protect young seedlings from direct sun."
        }
    ]

@app.get("/api/climate/forecast", response_model=list[schemas.WeatherForecast])
def get_weather_forecast():
    return [
        {"day": "Mon", "temp": "32°C", "condition": "Sunny"},
        {"day": "Tue", "temp": "30°C", "condition": "Rainy"},
        {"day": "Wed", "temp": "28°C", "condition": "Stormy"},
        {"day": "Thu", "temp": "31°C", "condition": "Cloudy"},
        {"day": "Fri", "temp": "33°C", "condition": "Sunny"}
    ]

@app.get("/api/climate/alerts/{alert_id}/analytics")
def get_alert_analytics(alert_id: str):
    # Simulated time-series data for Recharts
    if alert_id == "1": # Heavy Rain
        return {
            "title": "Precipitation Probability",
            "unit": "mm",
            "data": [
                {"time": "12:00", "value": 2},
                {"time": "15:00", "value": 5},
                {"time": "18:00", "value": 15},
                {"time": "21:00", "value": 45},
                {"time": "00:00", "value": 60},
                {"time": "03:00", "value": 30},
                {"time": "06:00", "value": 10},
            ]
        }
    elif alert_id == "2": # Heat Wave
        return {
            "title": "Temperature Trend",
            "unit": "°C",
            "data": [
                {"time": "08:00", "value": 29},
                {"time": "10:00", "value": 32},
                {"time": "12:00", "value": 36},
                {"time": "14:00", "value": 38},
                {"time": "16:00", "value": 37},
                {"time": "18:00", "value": 34},
                {"time": "20:00", "value": 31},
            ]
        }
    return {"title": "General Trend", "unit": "%", "data": []}

@app.get("/api/marketplace/prices")
def get_market_prices():
    return [
        {"id": 1, "crop": "Paddy (Common)", "price": 2300, "unit": "Quintal", "trend": "up", "change": "+₹45", "mandi": "Madurai"},
        {"id": 2, "crop": "Maize", "price": 2150, "unit": "Quintal", "trend": "down", "change": "-₹20", "mandi": "Salem"},
        {"id": 3, "crop": "Tomato", "price": 18, "unit": "kg", "trend": "up", "change": "+₹2", "mandi": "Coimbatore"},
        {"id": 4, "crop": "Cotton", "price": 7200, "unit": "Quintal", "trend": "up", "change": "+₹150", "mandi": "Tirupur"},
        {"id": 5, "crop": "Turmeric", "price": 14500, "unit": "Quintal", "trend": "up", "change": "+₹300", "mandi": "Erode"}
    ]

@app.get("/api/marketplace/demands")
def get_retailer_demands():
    return [
        {
            "id": 1,
            "retailer": "Green Life Organics",
            "crop": "Organic Tomato",
            "quantity": "2000kg",
            "price_offered": "₹22/kg",
            "location": "Chennai",
            "urgency": "High"
        },
        {
            "id": 2,
            "retailer": "Reliance Fresh",
            "crop": "Paddy (Ponni)",
            "quantity": "5000kg",
            "price_offered": "₹2500/qtl",
            "location": "Madurai",
            "urgency": "Normal"
        },
        {
            "id": 3,
            "retailer": "Heritage Foods",
            "crop": "Maize",
            "quantity": "10000kg",
            "price_offered": "₹2200/qtl",
            "location": "Erode",
            "urgency": "Normal"
        }
    ]
