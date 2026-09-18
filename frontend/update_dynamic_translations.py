import json
import os

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta_data = json.load(f)

# Crop translation mapping
if "crops" not in en_data:
    en_data["crops"] = {}
if "crops" not in ta_data:
    ta_data["crops"] = {}

en_data["crops"].update({
    "Paddy (Common)": "Paddy (Common)",
    "Maize": "Maize",
    "Tomato": "Tomato",
    "Cotton": "Cotton",
    "Turmeric": "Turmeric",
    "Organic Tomato": "Organic Tomato",
    "Paddy (Ponni)": "Paddy (Ponni)"
})

ta_data["crops"].update({
    "Paddy (Common)": "நெல் (சாதாரண)",
    "Maize": "மக்காச்சோளம்",
    "Tomato": "தக்காளி",
    "Cotton": "பருத்தி",
    "Turmeric": "மஞ்சள்",
    "Organic Tomato": "இயற்கை தக்காளி",
    "Paddy (Ponni)": "நெல் (பொன்னி)"
})

# City/location mapping
if "location" not in en_data:
    en_data["location"] = {}
if "location" not in ta_data:
    ta_data["location"] = {}

en_data["location"].update({
    "Madurai": "Madurai",
    "Salem": "Salem",
    "Coimbatore": "Coimbatore",
    "Tirupur": "Tirupur",
    "Erode": "Erode",
    "Chennai": "Chennai"
})

ta_data["location"].update({
    "Madurai": "மதுரை",
    "Salem": "சேலம்",
    "Coimbatore": "கோயம்புத்தூர்",
    "Tirupur": "திருப்பூர்",
    "Erode": "ஈரோடு",
    "Chennai": "சென்னை"
})

# Unit mapping
if "units" not in en_data:
    en_data["units"] = {}
if "units" not in ta_data:
    ta_data["units"] = {}
    
en_data["units"].update({
    "kg": "kg",
    "Quintal": "Quintal",
    "qtl": "qtl"
})

ta_data["units"].update({
    "kg": "கிலோ",
    "Quintal": "குவிண்டால்",
    "qtl": "குவிண்டால்"
})


with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

with open(ta_path, 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, ensure_ascii=False, indent=4)

print("Dynamic data translations mapped successfully!")
