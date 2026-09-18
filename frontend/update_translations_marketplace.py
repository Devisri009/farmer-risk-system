import json
import os

en_path = 'src/i18n/en.json'
ta_path = 'src/i18n/ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta_data = json.load(f)

# Sidebar mapping
if "sidebar" not in en_data:
    en_data["sidebar"] = {}
if "sidebar" not in ta_data:
    ta_data["sidebar"] = {}

en_data["sidebar"].update({
    "home": "Home",
    "postCrop": "Post Crop",
    "myBatches": "My Batches",
    "marketplace": "Marketplace",
    "communityFeed": "Community Feed",
    "climateAlerts": "Climate Alerts",
    "assistant": "Assistant",
    "settings": "Settings",
    "logout": "Logout"
})

ta_data["sidebar"].update({
    "home": "முகப்பு",
    "postCrop": "பயிர் பதிவேற்று",
    "myBatches": "என் தொகுதிகள்",
    "marketplace": "வேளாண் சந்தை",
    "communityFeed": "சமூக ஊட்டம்",
    "climateAlerts": "காலநிலை எச்சரிக்கைகள்",
    "assistant": "உதவியாளர் (Assistant)",
    "settings": "அமைப்புகள்",
    "logout": "வெளியேறு"
})

# Marketplace Mapping 
if "marketplace" not in en_data:
    en_data["marketplace"] = {}
if "marketplace" not in ta_data:
    ta_data["marketplace"] = {}

en_data["marketplace"].update({
    "bestOpportunity": "Best Opportunity",
    "oppItem": "Turmeric @ Erode",
    "oppTrend": "Up 2.5% this week",
    "marketSentiment": "Market Sentiment",
    "sentimentStatus": "Strong Bullish",
    "volumeAlert": "Volume Alert",
    "alertItem": "Tomato Surplus",
    "alertDesc": "High supply expected",
    "liveRates": "Live Mandi Rates",
    "updatesEvery": "Updates every 15 minutes",
    "searchPlaceholder": "Search crop or mandi...",
    "colCrop": "Crop Name",
    "colPricing": "Pricing",
    "colTrend": "Trend",
    "colMandi": "Primary Mandi",
    "colAction": "Action",
    "btnAnalytic": "Analytic",
    "urgent": "Urgent Request",
    "verified": "Verified Buyer",
    "demanding": "Demanding",
    "offerPrice": "Offer Price",
    "base": "Base",
    "initiateQuote": "Initiate Quote"
})

ta_data["marketplace"].update({
    "bestOpportunity": "சிறந்த வாய்ப்பு",
    "oppItem": "மஞ்சள் @ ஈரோடு",
    "oppTrend": "இந்த வாரம் 2.5% உயர்வு",
    "marketSentiment": "சந்தை உணர்வு",
    "sentimentStatus": "வலுவான ஏற்றம்",
    "volumeAlert": "அளவு எச்சரிக்கை",
    "alertItem": "தக்காளி உபரி",
    "alertDesc": "அதிக விநியோகம் எதிர்பார்க்கப்படுகிறது",
    "liveRates": "நேரடி மண்டி விலைகள்",
    "updatesEvery": "ஒவ்வொரு 15 நிமிடங்களுக்கும் புதுப்பிக்கப்படும்",
    "searchPlaceholder": "பயிர் அல்லது மண்டியைத் தேடு...",
    "colCrop": "பயிர் பெயர்",
    "colPricing": "விலை",
    "colTrend": "போக்கு",
    "colMandi": "முதன்மை மண்டி",
    "colAction": "செயல்",
    "btnAnalytic": "பகுப்பாய்வு",
    "urgent": "அவசர கோரிக்கை",
    "verified": "சரிபார்க்கப்பட்ட வாங்குபவர்",
    "demanding": "தேவைப்படுகிறது",
    "offerPrice": "வழங்கும் விலை",
    "base": "இடம்",
    "initiateQuote": "விலைப்பட்டியலை தொடங்கு"
})

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

with open(ta_path, 'w', encoding='utf-8') as f:
    json.dump(ta_data, f, ensure_ascii=False, indent=4)

print("Translation JSON files updated successfully!")
