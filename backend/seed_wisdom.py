from app.database import SessionLocal, engine
from app.models import Base, AIVisdom
import json

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_wisdom():
    db = SessionLocal()
    
    wisdom_data = [
        # Assistant Answers (English)
        {
            "key": "ask_en_how to grow paddy",
            "val": "To grow paddy (rice) successfully, ensure you have standing water in the fields. Start with high-quality seeds, prepare the soil with organic manure, and maintain a water level of 2-5cm. Harvest when the grains turn golden brown.",
            "lang": "en",
            "cat": "assistant"
        },
        {
            "key": "ask_en_what is farmvista",
            "val": "FarmVista is a next-generation agricultural platform that uses blockchain and AI to help farmers track their crop journey, get real-time climate alerts, and connect directly with retailers for better prices.",
            "lang": "en",
            "cat": "assistant"
        },
        # Assistant Answers (Tamil)
        {
            "key": "ask_ta_நெல் சாகுபடி முறை",
            "val": "நெல் சாகுபடிக்கு வயலில் எப்போதும் தண்ணீர் இருப்பது அவசியம். தரமான விதைகளைத் தேர்ந்தெடுத்து, இயற்கை உரங்களைப் பயன்படுத்தி மண்ணைத் தயார் செய்யவும். கதிர்கள் பொன்னிறமாக மாறும்போது அறுவடை செய்யவும்.",
            "lang": "ta",
            "cat": "assistant"
        },
        # Crop Rules (Analytics)
        {
            "key": "crop_rules_rice",
            "val": json.dumps({"max_temp": 34, "min_rain": 40, "max_rain": 120}),
            "lang": "en",
            "cat": "crop_rules"
        },
         {
            "key": "crop_rules_paddy",
            "val": json.dumps({"max_temp": 34, "min_rain": 40, "max_rain": 120}),
            "lang": "en",
            "cat": "crop_rules"
        },
        {
            "key": "crop_rules_tomato",
            "val": json.dumps({"max_temp": 32, "min_rain": 10, "max_rain": 40}),
            "lang": "en",
            "cat": "crop_rules"
        },
        {
            "key": "crop_rules_corn",
            "val": json.dumps({"max_temp": 35, "min_rain": 15, "max_rain": 50}),
            "lang": "en",
            "cat": "crop_rules"
        }
    ]

    for item in wisdom_data:
        # Check if already exists
        exists = db.query(AIVisdom).filter(AIVisdom.question_key == item["key"]).first()
        if not exists:
            w = AIVisdom(
                question_key=item["key"],
                answer=item["val"],
                language=item["lang"],
                category=item["cat"]
            )
            db.add(w)
    
    db.commit()
    db.close()
    print("Database Wisdom Seeded Successfully! Common questions will now work offline.")

if __name__ == "__main__":
    seed_wisdom()
