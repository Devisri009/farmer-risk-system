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
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed_password,
        role=user.role,
        location=user.location
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )
    
    if not auth.verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    
    return {
        "token": access_token, 
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to FarmVista API"}

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
