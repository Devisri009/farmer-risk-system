"""
Crop Recommender Service
Provides climate-aware, localized crop recommendations for Indian farmers based on
real-time multi-source weather consensus, seasonal calendars, soil types, and regional suitability.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any


# --- Indian Agronomic Crop Knowledge Base (24 Major Crops) ---

CROP_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    # Cereals & Millets
    {
        "crop_name": "Rice (Paddy)",
        "crop_name_ta": "நெல்",
        "category": "Cereals",
        "icon": "🌾",
        "temp_min": 20, "temp_max": 38, "temp_opt_min": 24, "temp_opt_max": 32,
        "water_need": "High",
        "ideal_rainfall_min": 100, "ideal_rainfall_max": 300,
        "seasons": ["Kharif", "Rabi", "All-Season"],
        "months": [6, 7, 8, 10, 11, 12],
        "soils": ["Alluvial", "Clay Loam", "Black Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Kerala", "West Bengal", "Punjab", "Odisha", "Bihar", "Uttar Pradesh", "All India"],
        "flood_sensitive": False,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": True,
        "planting_window": "Jun – Jul (Kuruvai / Kharif) or Oct – Nov (Samba / Rabi)",
        "planting_window_ta": "ஜூன் – ஜூலை (குறுவை) அல்லது அக் – நவ (சம்பா)",
        "duration_days": "110 - 135 days",
        "base_reason": "High water availability and warm tropical temperatures provide prime growing conditions.",
        "base_reason_ta": "போதிய நீர் வசதி மற்றும் மிதமான வெப்பம் நெல் பயிரிட சிறந்த சூழலைத் தருகிறது.",
    },
    {
        "crop_name": "Maize (Corn)",
        "crop_name_ta": "மக்காச்சோளம்",
        "category": "Cereals",
        "icon": "🌽",
        "temp_min": 18, "temp_max": 35, "temp_opt_min": 21, "temp_opt_max": 30,
        "water_need": "Medium",
        "ideal_rainfall_min": 50, "ideal_rainfall_max": 120,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 6, 7, 10, 11],
        "soils": ["Red Soil", "Alluvial", "Sandy Loam", "Black Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Madhya Pradesh", "Rajasthan", "Bihar", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Kharif) or Jan – Feb (Summer)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது ஜனவரி – பிப்ரவரி",
        "duration_days": "90 - 105 days",
        "base_reason": "Well-drained soils and moderate temperature yield quick maturity with resilient drought tolerance.",
        "base_reason_ta": "வடிகால் வசதியுள்ள மண் மற்றும் மிதமான வெப்பத்தில் குறுகிய காலத்தில் நல்ல விளைச்சல் தரும்.",
    },
    {
        "crop_name": "Ragi (Finger Millet)",
        "crop_name_ta": "கேழ்வரகு",
        "category": "Millets",
        "icon": "🌾",
        "temp_min": 15, "temp_max": 36, "temp_opt_min": 22, "temp_opt_max": 32,
        "water_need": "Low",
        "ideal_rainfall_min": 30, "ideal_rainfall_max": 80,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [5, 6, 7, 8, 12, 1],
        "soils": ["Red Soil", "Sandy Loam", "Laterite", "All Soils"],
        "regions": ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Odisha", "Maharashtra", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": False,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Aug (Main) or Dec – Jan (Irrigated)",
        "planting_window_ta": "ஜூன் – ஆகஸ்ட் அல்லது டிசம்பர் – ஜனவரி",
        "duration_days": "95 - 110 days",
        "base_reason": "Highly climate-resilient with low water demand; thrives on red and light soils.",
        "base_reason_ta": "குறைந்த நீர் தேவையும் அதிக வறட்சி தாங்கும் திறனும் கொண்டது; செம்மண்ணிற்கு மிகவும் ஏற்றது.",
    },
    {
        "crop_name": "Pearl Millet (Bajra)",
        "crop_name_ta": "கம்பு",
        "category": "Millets",
        "icon": "🌾",
        "temp_min": 20, "temp_max": 40, "temp_opt_min": 25, "temp_opt_max": 35,
        "water_need": "Low",
        "ideal_rainfall_min": 25, "ideal_rainfall_max": 75,
        "seasons": ["Kharif", "Zaid"],
        "months": [2, 3, 6, 7, 8],
        "soils": ["Sandy Loam", "Red Soil", "Black Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Rajasthan", "Gujarat", "Maharashtra", "Haryana", "Uttar Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Monsoon) or Feb – Mar (Summer)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது பிப்ரவரி – மார்ச்",
        "duration_days": "80 - 90 days",
        "base_reason": "Exceptional heat and drought tolerance with rapid 85-day harvest turnaround.",
        "base_reason_ta": "அதிக வெப்பம் மற்றும் வறட்சியை தாங்கி 85 நாட்களில் விரைவாக அறுவடைக்கு வரும்.",
    },
    {
        "crop_name": "Sorghum (Jowar)",
        "crop_name_ta": "சோளம்",
        "category": "Millets",
        "icon": "🌾",
        "temp_min": 16, "temp_max": 38, "temp_opt_min": 24, "temp_opt_max": 32,
        "water_need": "Low",
        "ideal_rainfall_min": 35, "ideal_rainfall_max": 90,
        "seasons": ["Kharif", "Rabi"],
        "months": [6, 7, 9, 10],
        "soils": ["Black Soil", "Red Soil", "Clay Loam", "All Soils"],
        "regions": ["Tamil Nadu", "Maharashtra", "Karnataka", "Madhya Pradesh", "Andhra Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Kharif) or Sep – Oct (Rabi)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது செப்டம்பர் – அக்டோபர்",
        "duration_days": "100 - 115 days",
        "base_reason": "Thrives in dryland conditions with deep rooting in black and red soils.",
        "base_reason_ta": "மானாவாரி நிலங்கள் மற்றும் கரிசல் மண்ணில் குறைந்த நீரில் நன்கு வளரும்.",
    },
    {
        "crop_name": "Wheat",
        "crop_name_ta": "கோதுமை",
        "category": "Cereals",
        "icon": "🌾",
        "temp_min": 10, "temp_max": 28, "temp_opt_min": 14, "temp_opt_max": 22,
        "water_need": "Medium",
        "ideal_rainfall_min": 40, "ideal_rainfall_max": 100,
        "seasons": ["Rabi"],
        "months": [10, 11, 12],
        "soils": ["Alluvial", "Clay Loam", "Black Soil", "All Soils"],
        "regions": ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Bihar", "North India"],
        "flood_sensitive": True,
        "frost_sensitive": False,
        "drought_resistant": False,
        "humidity_pest_sensitive": True,
        "planting_window": "Late Oct – Nov (Rabi season)",
        "planting_window_ta": "அக்டோபர் இறுதி – நவம்பர் (ரபி பருவம்)",
        "duration_days": "115 - 130 days",
        "base_reason": "Cool winter climate and loamy soils support optimal grain filling.",
        "base_reason_ta": "குளிர்ந்த தட்பவெப்ப நிலை மற்றும் வண்டல் மண்ணில் சிறந்த மகசூல் கிடைக்கும்.",
    },

    # Oilseeds
    {
        "crop_name": "Groundnut (Peanut)",
        "crop_name_ta": "வேர்க்கடலை",
        "category": "Oilseeds",
        "icon": "🥜",
        "temp_min": 20, "temp_max": 36, "temp_opt_min": 25, "temp_opt_max": 32,
        "water_need": "Low",
        "ideal_rainfall_min": 40, "ideal_rainfall_max": 90,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 6, 7, 11, 12],
        "soils": ["Red Soil", "Sandy Loam", "All Soils"],
        "regions": ["Tamil Nadu", "Gujarat", "Andhra Pradesh", "Rajasthan", "Karnataka", "Maharashtra", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Rainfed) or Dec – Feb (Irrigated/Summer)",
        "planting_window_ta": "ஜூன் – ஜூலை (மானாவாரி) அல்லது டிசம்பர் – பிப்ரவரி (இறவை)",
        "duration_days": "105 - 120 days",
        "base_reason": "Loose sandy/red soils ensure easy pod development and high oil content.",
        "base_reason_ta": "செம்மண் மற்றும் மணற்பாங்கான நிலங்களில் காய்கள் திரட்சியாக நன்கு பிடிக்கும்.",
    },
    {
        "crop_name": "Sesame (Gingelly)",
        "crop_name_ta": "எள்ளு",
        "category": "Oilseeds",
        "icon": "🌱",
        "temp_min": 22, "temp_max": 40, "temp_opt_min": 26, "temp_opt_max": 34,
        "water_need": "Low",
        "ideal_rainfall_min": 25, "ideal_rainfall_max": 60,
        "seasons": ["Zaid", "Kharif", "Rabi"],
        "months": [1, 2, 3, 6, 7],
        "soils": ["Sandy Loam", "Red Soil", "Alluvial", "All Soils"],
        "regions": ["Tamil Nadu", "Gujarat", "West Bengal", "Rajasthan", "Madhya Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Feb – Mar (Summer/Zaid) or Jun – Jul (Kharif)",
        "planting_window_ta": "பிப்ரவரி – மார்ச் (கோடை) அல்லது ஜூன் – ஜூலை",
        "duration_days": "75 - 85 days",
        "base_reason": "Fast 80-day crop with minimal water requirements and excellent market value.",
        "base_reason_ta": "குறைந்த நீர் தேவையில் 80 நாட்களில் நல்ல லாபம் தரும் குறுகிய கால பணப்பயிர்.",
    },
    {
        "crop_name": "Sunflower",
        "crop_name_ta": "சூரியகாந்தி",
        "category": "Oilseeds",
        "icon": "🌻",
        "temp_min": 18, "temp_max": 36, "temp_opt_min": 22, "temp_opt_max": 30,
        "water_need": "Medium",
        "ideal_rainfall_min": 45, "ideal_rainfall_max": 95,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 6, 7, 10, 11],
        "soils": ["Black Soil", "Alluvial", "Red Soil", "All Soils"],
        "regions": ["Karnataka", "Tamil Nadu", "Maharashtra", "Andhra Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Kharif) or Jan – Feb (Summer)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது ஜனவரி – பிப்ரவரி",
        "duration_days": "85 - 95 days",
        "base_reason": "Photo-insensitive crop suitable across seasons with strong seed demand.",
        "base_reason_ta": "எல்லா பருவங்களிலும் பயிரிடக்கூடிய நிலையான வருமானம் தரும் எண்ணெய் வித்து.",
    },
    {
        "crop_name": "Mustard",
        "crop_name_ta": "கடுகு",
        "category": "Oilseeds",
        "icon": "🌼",
        "temp_min": 10, "temp_max": 28, "temp_opt_min": 15, "temp_opt_max": 24,
        "water_need": "Low",
        "ideal_rainfall_min": 25, "ideal_rainfall_max": 65,
        "seasons": ["Rabi"],
        "months": [9, 10, 11],
        "soils": ["Alluvial", "Sandy Loam", "Clay Loam", "All Soils"],
        "regions": ["Rajasthan", "Haryana", "Madhya Pradesh", "Uttar Pradesh", "West Bengal", "Gujarat", "North India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": True,
        "planting_window": "Late Sep – Oct (Rabi)",
        "planting_window_ta": "செப்டம்பர் இறுதி – அக்டோபர் (ரபி)",
        "duration_days": "100 - 120 days",
        "base_reason": "Cool temperature and dry harvest conditions maximize oil yield.",
        "base_reason_ta": "குளிர்ந்த காலநிலையில் குறைந்த நீரில் அதிக எண்ணெய் மகசூல் கிடைக்கும்.",
    },

    # Pulses
    {
        "crop_name": "Black Gram (Urad)",
        "crop_name_ta": "உளுந்து",
        "category": "Pulses",
        "icon": "🌱",
        "temp_min": 22, "temp_max": 38, "temp_opt_min": 25, "temp_opt_max": 33,
        "water_need": "Low",
        "ideal_rainfall_min": 30, "ideal_rainfall_max": 75,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 6, 7, 9, 10],
        "soils": ["Black Soil", "Clay Loam", "Alluvial", "Red Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Andhra Pradesh", "Madhya Pradesh", "Uttar Pradesh", "Maharashtra", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Kharif), Sep – Oct (Rabi), or Jan – Feb (Rice Fallow)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது நெல் தரிசில் ஜனவரி – பிப்ரவரி",
        "duration_days": "65 - 75 days",
        "base_reason": "Short 70-day duration, enriches soil nitrogen, and fits perfectly into crop rotations.",
        "base_reason_ta": "மண்ணிற்கு தழைச்சத்தை கூட்டி 70 நாட்களில் அறுவடை தரும் சிறந்த சுழற்சி பயிர்.",
    },
    {
        "crop_name": "Green Gram (Moong)",
        "crop_name_ta": "பாசிப்பயறு",
        "category": "Pulses",
        "icon": "🌱",
        "temp_min": 22, "temp_max": 38, "temp_opt_min": 26, "temp_opt_max": 34,
        "water_need": "Low",
        "ideal_rainfall_min": 25, "ideal_rainfall_max": 70,
        "seasons": ["Kharif", "Zaid", "Rabi"],
        "months": [2, 3, 6, 7],
        "soils": ["Sandy Loam", "Red Soil", "Black Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Rajasthan", "Maharashtra", "Karnataka", "Andhra Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Feb – Mar (Summer/Zaid) or Jun – Jul (Kharif)",
        "planting_window_ta": "பிப்ரவரி – மார்ச் (கோடை) அல்லது ஜூன் – ஜூலை",
        "duration_days": "60 - 70 days",
        "base_reason": "Ultra-fast 65-day harvest with minimal inputs and high protein grain demand.",
        "base_reason_ta": "குறைந்த முதலீட்டில் 65 நாட்களில் துரித மகசூல் மற்றும் நிலையான சந்தை விலை.",
    },
    {
        "crop_name": "Red Gram (Pigeon Pea / Tur)",
        "crop_name_ta": "துவரை",
        "category": "Pulses",
        "icon": "🌱",
        "temp_min": 18, "temp_max": 36, "temp_opt_min": 24, "temp_opt_max": 32,
        "water_need": "Low",
        "ideal_rainfall_min": 40, "ideal_rainfall_max": 85,
        "seasons": ["Kharif"],
        "months": [6, 7, 8],
        "soils": ["Red Soil", "Black Soil", "Sandy Loam", "All Soils"],
        "regions": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Tamil Nadu", "Gujarat", "Telangana", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": False,
        "planting_window": "Jun – Jul (Monsoon onset)",
        "planting_window_ta": "ஜூன் – ஜூலை (பருவமழை ஆரம்பம்)",
        "duration_days": "140 - 170 days",
        "base_reason": "Deep taproot system thrives in rainfed conditions and provides steady high pulse returns.",
        "base_reason_ta": "ஆழமான வேர் அமைப்பு கொண்டதால் மானாவாரியிலும் வறட்சியை தாங்கி நல்ல லாபம் தரும்.",
    },
    {
        "crop_name": "Chickpea (Bengal Gram)",
        "crop_name_ta": "கொண்டைக்கடலை",
        "category": "Pulses",
        "icon": "🌱",
        "temp_min": 12, "temp_max": 30, "temp_opt_min": 18, "temp_opt_max": 25,
        "water_need": "Low",
        "ideal_rainfall_min": 20, "ideal_rainfall_max": 60,
        "seasons": ["Rabi"],
        "months": [10, 11],
        "soils": ["Black Soil", "Clay Loam", "All Soils"],
        "regions": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Karnataka", "Uttar Pradesh", "Andhra Pradesh", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": True,
        "planting_window": "Oct – Nov (Post-monsoon Rabi)",
        "planting_window_ta": "அக்டோபர் – நவம்பர் (ரபி பருவம்)",
        "duration_days": "95 - 110 days",
        "base_reason": "Residual soil moisture in black soil produces excellent pod setting during cool months.",
        "base_reason_ta": "கரிசல் மண்ணின் ஈரப்பதத்தை பயன்படுத்தி குளிர் காலத்தில் செழித்து வளரும்.",
    },

    # Commercial & Cash Crops
    {
        "crop_name": "Cotton",
        "crop_name_ta": "பருத்தி",
        "category": "Cash Crops",
        "icon": "☁️",
        "temp_min": 21, "temp_max": 38, "temp_opt_min": 25, "temp_opt_max": 34,
        "water_need": "Medium",
        "ideal_rainfall_min": 50, "ideal_rainfall_max": 110,
        "seasons": ["Kharif"],
        "months": [4, 5, 6, 7, 8],
        "soils": ["Black Soil", "Alluvial", "Red Soil", "All Soils"],
        "regions": ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Tamil Nadu", "Rajasthan", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": True,
        "planting_window": "May – Jul (Kharif / Monsoon)",
        "planting_window_ta": "மே – ஜூலை (பருவமழை ஆரம்பம்)",
        "duration_days": "150 - 170 days",
        "base_reason": "High heat units and deep moisture-retaining black soil support continuous boll development.",
        "base_reason_ta": "வெப்பமான தட்பவெப்பம் மற்றும் ஈரப்பதம் தேக்கும் கரிசல் மண்ணில் தரமான பஞ்சு கிடைக்கும்.",
    },
    {
        "crop_name": "Sugarcane",
        "crop_name_ta": "கரும்பு",
        "category": "Cash Crops",
        "icon": "🎋",
        "temp_min": 20, "temp_max": 38, "temp_opt_min": 26, "temp_opt_max": 34,
        "water_need": "High",
        "ideal_rainfall_min": 100, "ideal_rainfall_max": 250,
        "seasons": ["All-Season"],
        "months": [1, 2, 3, 11, 12],
        "soils": ["Alluvial", "Clay Loam", "Black Soil", "Red Soil", "All Soils"],
        "regions": ["Uttar Pradesh", "Maharashtra", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Bihar", "All India"],
        "flood_sensitive": False,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": False,
        "planting_window": "Dec – Mar (Main planting)",
        "planting_window_ta": "டிசம்பர் – மார்ச் (முக்கிய பருவம்)",
        "duration_days": "300 - 365 days",
        "base_reason": "Long sunny days and reliable irrigation yield high sucrose cane tonnage.",
        "base_reason_ta": "போதுமான நீர்ப்பாசனம் மற்றும் சூரிய ஒளியில் அதிக சர்க்கரை சத்து மற்றும் எடைக் கூடும்.",
    },
    {
        "crop_name": "Turmeric",
        "crop_name_ta": "மஞ்சள்",
        "category": "Spices",
        "icon": "🟡",
        "temp_min": 20, "temp_max": 36, "temp_opt_min": 25, "temp_opt_max": 32,
        "water_need": "Medium",
        "ideal_rainfall_min": 60, "ideal_rainfall_max": 140,
        "seasons": ["Kharif"],
        "months": [5, 6, 7],
        "soils": ["Red Soil", "Clay Loam", "Alluvial", "All Soils"],
        "regions": ["Tamil Nadu", "Telangana", "Maharashtra", "Andhra Pradesh", "Kerala", "Odisha", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": False,
        "planting_window": "May – Jun (Pre-monsoon)",
        "planting_window_ta": "மே – ஜூன் (பருவமழைக்கு முன்)",
        "duration_days": "240 - 270 days",
        "base_reason": "Friable loamy/red soils promote healthy rhizome expansion and high curcumin value.",
        "base_reason_ta": "செம்மண் நிலத்தில் மஞ்சள் கிழங்குகள் நன்கு திரண்டு அதிக குர்குமின் சத்து கிடைக்கும்.",
    },

    # Horticulture & Vegetables
    {
        "crop_name": "Tomato",
        "crop_name_ta": "தக்காளி",
        "category": "Vegetables",
        "icon": "🍅",
        "temp_min": 16, "temp_max": 34, "temp_opt_min": 20, "temp_opt_max": 28,
        "water_need": "Medium",
        "ideal_rainfall_min": 30, "ideal_rainfall_max": 80,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 5, 6, 9, 10, 11],
        "soils": ["Red Soil", "Sandy Loam", "Clay Loam", "All Soils"],
        "regions": ["Tamil Nadu", "Andhra Pradesh", "Karnataka", "Madhya Pradesh", "Maharashtra", "Gujarat", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": True,
        "planting_window": "Jun – Jul, Oct – Nov, or Jan – Feb",
        "planting_window_ta": "ஜூன் – ஜூலை, அக் – நவ, அல்லது ஜன – பிப்",
        "duration_days": "75 - 90 days",
        "base_reason": "Fast fruit setting with high continuous local mandi cash flow.",
        "base_reason_ta": "குறுகிய காலத்தில் தொடர் அறுவடை தந்து உள்ளூர் சந்தையில் உடனடி வருமானம் தரும்.",
    },
    {
        "crop_name": "Onion",
        "crop_name_ta": "வெங்காயம்",
        "category": "Vegetables",
        "icon": "🧅",
        "temp_min": 15, "temp_max": 33, "temp_opt_min": 18, "temp_opt_max": 26,
        "water_need": "Medium",
        "ideal_rainfall_min": 30, "ideal_rainfall_max": 75,
        "seasons": ["Kharif", "Rabi", "Zaid"],
        "months": [5, 6, 9, 10, 11],
        "soils": ["Sandy Loam", "Red Soil", "Alluvial", "All Soils"],
        "regions": ["Maharashtra", "Karnataka", "Madhya Pradesh", "Tamil Nadu", "Gujarat", "Rajasthan", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": False,
        "drought_resistant": False,
        "humidity_pest_sensitive": True,
        "planting_window": "Oct – Nov (Rabi) or May – Jun (Kharif)",
        "planting_window_ta": "அக்டோபர் – நவம்பர் அல்லது மே – ஜூன்",
        "duration_days": "90 - 110 days",
        "base_reason": "Mild temperatures during bulb swelling ensure dense bulbs and excellent storage shelf-life.",
        "base_reason_ta": "மிதமான வெப்பத்தில் வெங்காயத்தாள் நன்கு திரண்டு அதிக நாட்கள் சேமித்து வைக்க உதவும்.",
    },
    {
        "crop_name": "Chilli",
        "crop_name_ta": "மிளகாய்",
        "category": "Vegetables",
        "icon": "🌶️",
        "temp_min": 18, "temp_max": 36, "temp_opt_min": 22, "temp_opt_max": 30,
        "water_need": "Medium",
        "ideal_rainfall_min": 35, "ideal_rainfall_max": 85,
        "seasons": ["Kharif", "Rabi", "Zaid", "All-Season"],
        "months": [1, 2, 5, 6, 9, 10],
        "soils": ["Black Soil", "Red Soil", "Sandy Loam", "All Soils"],
        "regions": ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Karnataka", "Madhya Pradesh", "Maharashtra", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": True,
        "humidity_pest_sensitive": True,
        "planting_window": "Jun – Jul (Kharif) or Jan – Feb (Summer)",
        "planting_window_ta": "ஜூன் – ஜூலை அல்லது ஜனவரி – பிப்ரவரி",
        "duration_days": "120 - 150 days",
        "base_reason": "Steady market demand for green and dry chilli with multi-pick harvesting.",
        "base_reason_ta": "பச்சை மற்றும் வத்தல் மிளகாய்க்கு நிலையான கிராக்கியுடன் தொடர் அறுவடை செய்யலாம்.",
    },
    {
        "crop_name": "Brinjal (Eggplant)",
        "crop_name_ta": "கத்தரிக்காய்",
        "category": "Vegetables",
        "icon": "🍆",
        "temp_min": 18, "temp_max": 36, "temp_opt_min": 22, "temp_opt_max": 30,
        "water_need": "Medium",
        "ideal_rainfall_min": 35, "ideal_rainfall_max": 85,
        "seasons": ["All-Season"],
        "months": [1, 2, 6, 7, 9, 10],
        "soils": ["Clay Loam", "Sandy Loam", "Red Soil", "All Soils"],
        "regions": ["Tamil Nadu", "West Bengal", "Odisha", "Gujarat", "Bihar", "Karnataka", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": False,
        "planting_window": "Year-round (Jun – Jul or Dec – Jan optimal)",
        "planting_window_ta": "ஆண்டு முழுவதும் (ஜூன் – ஜூலை அல்லது டிசம்பர் – ஜனவரி சிறப்பு)",
        "duration_days": "110 - 130 days",
        "base_reason": "Resilient multi-harvest vegetable with steady domestic kitchen consumption.",
        "base_reason_ta": "நீண்ட கால தொடர் விளைச்சல் தரும் எளிய பராமரிப்பு கொண்ட காய்கறி பயிர்.",
    },
    {
        "crop_name": "Okra (Lady's Finger)",
        "crop_name_ta": "வெண்டைக்காய்",
        "category": "Vegetables",
        "icon": "🥬",
        "temp_min": 20, "temp_max": 38, "temp_opt_min": 25, "temp_opt_max": 34,
        "water_need": "Medium",
        "ideal_rainfall_min": 30, "ideal_rainfall_max": 75,
        "seasons": ["Zaid", "Kharif", "All-Season"],
        "months": [2, 3, 6, 7, 8],
        "soils": ["Sandy Loam", "Clay Loam", "Red Soil", "All Soils"],
        "regions": ["Tamil Nadu", "Gujarat", "Maharashtra", "Andhra Pradesh", "West Bengal", "All India"],
        "flood_sensitive": True,
        "frost_sensitive": True,
        "drought_resistant": False,
        "humidity_pest_sensitive": False,
        "planting_window": "Feb – Mar (Summer) or Jun – Jul (Monsoon)",
        "planting_window_ta": "பிப்ரவரி – மார்ச் (கோடை) அல்லது ஜூன் – ஜூலை",
        "duration_days": "60 - 75 days",
        "base_reason": "Rapid 55-day first picking with high summer vegetable prices.",
        "base_reason_ta": "55 நாட்களில் முதல் அறுவடை தந்து கோடையில் நல்ல சந்தை விலை தரும்.",
    },
]


def _get_current_season(month: int) -> str:
    """Returns Indian agricultural season based on month (1-12)."""
    if month in (6, 7, 8, 9, 10):
        return "Kharif"
    elif month in (11, 12, 1, 2):
        return "Rabi"
    else:  # 3, 4, 5
        return "Zaid"


def _score_temperature(temp: float, crop: Dict[str, Any]) -> float:
    """Score temperature suitability (0 to 25 pts)."""
    opt_min = crop["temp_opt_min"]
    opt_max = crop["temp_opt_max"]
    abs_min = crop["temp_min"]
    abs_max = crop["temp_max"]

    if opt_min <= temp <= opt_max:
        return 25.0
    elif abs_min <= temp < opt_min:
        return max(5.0, 25.0 - (opt_min - temp) * 3.5)
    elif opt_max < temp <= abs_max:
        return max(5.0, 25.0 - (temp - opt_max) * 3.5)
    else:
        return 0.0


def _score_water_and_rainfall(weather: Dict[str, Any], crop: Dict[str, Any]) -> float:
    """Score water/rainfall match (0 to 25 pts)."""
    water_need = crop["water_need"]
    rain_chance = float(weather.get("rain_chance", 0) or 0)
    rainfall = float(weather.get("rainfall", 0) or 0)
    forecast = weather.get("forecast", [])

    fc_rain_sum = sum(float(d.get("rainfall", 0) or 0) for d in forecast)

    if water_need == "Low":
        if fc_rain_sum < 20 and rain_chance < 40:
            return 25.0
        elif fc_rain_sum < 50:
            return 20.0
        else:
            return 12.0
    elif water_need == "Medium":
        if 15 <= fc_rain_sum <= 70 or (20 <= rain_chance <= 60):
            return 25.0
        else:
            return 18.0
    else:  # High
        if fc_rain_sum >= 40 or rainfall > 5 or rain_chance > 50:
            return 25.0
        else:
            return 15.0


def _score_season(month: int, crop: Dict[str, Any]) -> float:
    """Score seasonal alignment (0 to 25 pts)."""
    current_season = _get_current_season(month)
    crop_seasons = crop.get("seasons", [])
    crop_months = crop.get("months", [])

    score = 0.0
    if "All-Season" in crop_seasons:
        score += 20.0
    elif current_season in crop_seasons:
        score += 22.0
    else:
        score += 8.0

    if month in crop_months:
        score += 3.0

    return min(25.0, score)


def _score_soil_and_region(soil_type: Optional[str], district: str, state: str, crop: Dict[str, Any]) -> float:
    """Score soil and regional compatibility (0 to 25 pts)."""
    score = 15.0

    crop_regions = crop.get("regions", [])
    if "All India" in crop_regions or state in crop_regions or any(r in state for r in crop_regions):
        score += 5.0
    elif district in str(crop_regions):
        score += 5.0

    if not soil_type or soil_type.lower() in ("all soils", "auto-detect", "all", ""):
        score += 5.0
    else:
        matching_soils = [s.lower() for s in crop.get("soils", [])]
        if soil_type.lower() in matching_soils or "all soils" in matching_soils:
            score += 5.0
        else:
            score -= 4.0

    return max(0.0, min(25.0, score))


def _calculate_hazard_penalty(weather: Dict[str, Any], crop: Dict[str, Any]) -> float:
    """Deduct penalty points for severe weather vulnerability (0 to -20 pts)."""
    penalty = 0.0
    temp = float(weather.get("temperature", 28) or 28)
    humidity = float(weather.get("humidity", 60) or 60)
    rainfall = float(weather.get("rainfall", 0) or 0)
    forecast = weather.get("forecast", [])
    fc_rain_sum = sum(float(d.get("rainfall", 0) or 0) for d in forecast)

    if crop.get("flood_sensitive") and (fc_rain_sum > 60 or rainfall > 25):
        penalty += 15.0

    if crop.get("frost_sensitive") and temp < 12:
        penalty += 15.0

    if crop.get("humidity_pest_sensitive") and humidity > 85 and temp > 28:
        penalty += 8.0

    if crop.get("water_need") == "High" and temp > 35 and fc_rain_sum < 5:
        penalty += 12.0

    return min(25.0, penalty)


def recommend_crops(
    weather_data: Optional[Dict[str, Any]] = None,
    district: str = "Madurai",
    state: str = "Tamil Nadu",
    soil_type: Optional[str] = None,
    current_date: Optional[datetime] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """
    Evaluates all crops in the knowledge base and produces top ranked recommendations
    with risk levels, planting windows, and bilingual plain-language reasons.
    """
    now = current_date or datetime.utcnow()
    month = now.month
    season = _get_current_season(month)

    weather = weather_data or {
        "temperature": 30.0,
        "humidity": 65.0,
        "rainfall": 0.0,
        "rain_chance": 15,
        "windSpeed": 10.0,
        "condition": "Partly Cloudy",
        "forecast": [],
    }

    temp = float(weather.get("temperature", 30) or 30)
    results = []

    for crop in CROP_KNOWLEDGE_BASE:
        s_temp = _score_temperature(temp, crop)
        s_water = _score_water_and_rainfall(weather, crop)
        s_season = _score_season(month, crop)
        s_soil = _score_soil_and_region(soil_type, district, state, crop)
        hazard_penalty = _calculate_hazard_penalty(weather, crop)

        raw_score = s_temp + s_water + s_season + s_soil - hazard_penalty
        final_score = int(max(20, min(96, round(raw_score))))

        if final_score >= 78:
            risk_level = "Low"
        elif final_score >= 60:
            risk_level = "Medium"
        else:
            risk_level = "High"

        reason_en = crop["base_reason"]
        reason_ta = crop["base_reason_ta"]

        if hazard_penalty > 10 and crop.get("flood_sensitive"):
            reason_en = f"High rainfall expected in next 5 days. Ensure raised beds and proper drainage."
            reason_ta = f"அடுத்த 5 நாட்களில் மழை வாய்ப்புள்ளதால் மேட்டுப்பாத்தி அமைத்து நீர் தேங்காமல் பார்த்துக் கொள்ளவும்."
        elif s_temp >= 24:
            reason_en = f"Consensus temp ({temp}°C) matches ideal growth curve for {crop['crop_name']}."
            reason_ta = f"தற்போதைய வெப்பநிலை ({temp}°C) {crop['crop_name_ta']} பயிரின் துரித வளர்ச்சிக்கு உகந்தது."

        results.append({
            "crop_name": crop["crop_name"],
            "crop_name_ta": crop["crop_name_ta"],
            "category": crop["category"],
            "icon": crop["icon"],
            "suitability_score": final_score,
            "risk_level": risk_level,
            "planting_window": crop["planting_window"],
            "planting_window_ta": crop["planting_window_ta"],
            "reason": reason_en,
            "reason_ta": reason_ta,
            "water_need": crop["water_need"],
            "ideal_soil": "/".join(crop["soils"][:2]),
            "duration_days": crop["duration_days"],
        })

    results.sort(key=lambda x: x["suitability_score"], reverse=True)
    top_recommendations = results[:limit]

    return {
        "location": f"{district}, {state}",
        "season": f"{season} ({now.strftime('%B')})",
        "soil_type_used": soil_type or "All Soils",
        "weather_summary": {
            "temperature": temp,
            "condition": weather.get("condition", "Fair"),
            "rain_chance": weather.get("rain_chance", 0),
            "humidity": weather.get("humidity", 60),
        },
        "recommendations": top_recommendations,
    }
