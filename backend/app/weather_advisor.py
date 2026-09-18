"""
Gemini AI Weather Advisor
Uses real-time Open-Meteo weather data + Gemini AI to generate:
  - Crop-specific recommendations
  - Weather-based alerts
  - Actionable farming advice
"""

import os
import json
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_advice_cache = {}
ADVICE_CACHE_TTL = 3600  # 1 hour — AI advice doesn't need to change every minute


async def generate_crop_recommendations(
    weather: dict,
    forecast: list,
    farmer_crops: list,
    location: str,
    language: str = "en"
) -> dict:
    """
    Sends current weather + forecast to Gemini AI and gets back:
    - crop recommendations (safe/caution/avoid for each crop)
    - weather alerts based on forecast
    - general farming tips
    """
    # Build a cache key from weather snapshot
    cache_key = f"{location}_{weather.get('temperature', 0)}_{weather.get('condition', '')}_{language}"
    if cache_key in _advice_cache:
        cached, ts = _advice_cache[cache_key]
        if time.time() - ts < ADVICE_CACHE_TTL:
            return cached

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — returning rule-based fallback")
        return _rule_based_fallback(weather, farmer_crops)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        # Build the forecast summary for the prompt
        forecast_lines = []
        for f in forecast[:5]:
            forecast_lines.append(
                f"  {f['day']} ({f.get('date', '')}): {f['temp']}, {f['condition']}, Rain: {f.get('rainfall', 0)}mm, Wind: {f.get('windSpeed', 0)}km/h"
            )
        forecast_text = "\n".join(forecast_lines) if forecast_lines else "Forecast unavailable"

        crop_list = ", ".join(farmer_crops) if farmer_crops else "Rice, Tomato, Groundnut, Corn"

        prompt = f"""You are an expert agricultural advisor for farmers in India.

Current weather at {location}:
- Temperature: {weather.get('temperature', 'N/A')}°C (Feels like: {weather.get('feels_like', 'N/A')}°C)
- Condition: {weather.get('condition', 'Unknown')}
- Humidity: {weather.get('humidity', 'N/A')}%
- Wind Speed: {weather.get('windSpeed', 'N/A')} km/h
- Current Rainfall: {weather.get('rainfall', 0)} mm

5-Day Forecast:
{forecast_text}

Farmer's crops: {crop_list}

Based on this REAL weather data, provide practical farming advice.

Return ONLY a valid JSON object (no markdown, no code fences) with this exact structure:
{{
  "recommendations": [
    {{
      "crop": "CropName",
      "risk": "Low" or "Moderate" or "High",
      "advice": "One practical sentence of advice for this crop based on today's weather"
    }}
  ],
  "alerts": [
    {{
      "id": "1",
      "type": "Alert Title (e.g., Heavy Rain Warning, Heat Wave Alert)",
      "severity": "High" or "Medium" or "Low",
      "description": "2-3 sentence description of the weather concern",
      "advice": "What the farmer should do about it",
      "time": "Based on forecast"
    }}
  ],
  "farmingTips": [
    "Practical tip 1 based on today's weather",
    "Practical tip 2",
    "Practical tip 3"
  ]
}}

Rules:
- Include a recommendation for EACH crop listed
- Only create alerts if the weather/forecast genuinely warrants it (e.g., heavy rain, extreme heat, strong wind). If weather is normal, return an empty alerts array.
- Tips should be actionable and specific to today's conditions
- Keep all text concise and practical for small-scale farmers
{"- Respond in Tamil (தமிழ்)" if language == "ta" else "- Respond in English"}
"""

        response = await client.aio.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        text = response.text.strip()

        # Clean up any markdown code fences
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]

        result = json.loads(text.strip())

        # Ensure expected structure
        if "recommendations" not in result:
            result["recommendations"] = []
        if "alerts" not in result:
            result["alerts"] = []
        if "farmingTips" not in result:
            result["farmingTips"] = []

        # Add location to alerts
        for alert in result["alerts"]:
            if "location" not in alert:
                alert["location"] = location
            if "time" not in alert:
                alert["time"] = "Today"

        # Cache the result
        _advice_cache[cache_key] = (result, time.time())
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return _rule_based_fallback(weather, farmer_crops)
    except Exception as e:
        logger.error(f"Gemini Weather Advisor error: {e}")
        return _rule_based_fallback(weather, farmer_crops)


def _rule_based_fallback(weather: dict, crops: list) -> dict:
    """
    Simple rule-based fallback when Gemini is unavailable.
    """
    temp = weather.get("temperature", 30)
    rain = weather.get("rainfall", 0)
    humidity = weather.get("humidity", 60)
    wind = weather.get("windSpeed", 10)
    condition = weather.get("condition", "Sunny")

    recommendations = []
    crop_rules = {
        "Rice": {"max_temp": 38, "ideal_humidity": 70, "rain_ok": True},
        "Tomato": {"max_temp": 35, "ideal_humidity": 55, "rain_ok": False},
        "Corn": {"max_temp": 35, "ideal_humidity": 60, "rain_ok": False},
        "Groundnut": {"max_temp": 36, "ideal_humidity": 50, "rain_ok": False},
        "Sugarcane": {"max_temp": 38, "ideal_humidity": 65, "rain_ok": True},
        "Onion": {"max_temp": 32, "ideal_humidity": 55, "rain_ok": False},
        "Chilli": {"max_temp": 35, "ideal_humidity": 60, "rain_ok": False},
    }

    target_crops = crops if crops else ["Rice", "Tomato", "Corn"]

    for crop_name in target_crops:
        rules = crop_rules.get(crop_name, {"max_temp": 35, "ideal_humidity": 60, "rain_ok": False})
        risk = "Low"
        advice = f"Good conditions for {crop_name} today."

        if temp > rules["max_temp"]:
            risk = "High"
            advice = f"Temperature too high for {crop_name}. Increase irrigation and provide shade."
        elif temp > rules["max_temp"] - 3:
            risk = "Moderate"
            advice = f"Temperature is warm for {crop_name}. Monitor closely and water in the evening."
        elif rain > 10 and not rules["rain_ok"]:
            risk = "High"
            advice = f"Heavy rain can damage {crop_name}. Ensure proper drainage."
        elif rain > 0 and not rules["rain_ok"]:
            risk = "Moderate"
            advice = f"Light rain — watch {crop_name} for fungal issues."

        recommendations.append({"crop": crop_name, "risk": risk, "advice": advice})

    alerts = []
    if temp > 38:
        alerts.append({
            "id": "heat_1",
            "type": "Heat Wave Warning",
            "severity": "High",
            "description": f"Temperature is {temp}°C. Extreme heat can cause crop stress and wilting.",
            "advice": "Increase irrigation frequency. Avoid field work during peak hours (11 AM - 3 PM).",
            "location": "Your Area",
            "time": "Now"
        })
    if rain > 20:
        alerts.append({
            "id": "rain_1",
            "type": "Heavy Rain Warning",
            "severity": "High",
            "description": f"Rainfall of {rain}mm detected. Risk of waterlogging and root damage.",
            "advice": "Clear drainage channels. Postpone fertilizer and pesticide application.",
            "location": "Your Area",
            "time": "Now"
        })
    if wind > 25:
        alerts.append({
            "id": "wind_1",
            "type": "Strong Wind Alert",
            "severity": "Medium",
            "description": f"Wind speed at {wind} km/h. May damage tall crops and young seedlings.",
            "advice": "Secure stakes and supports. Avoid pesticide spraying.",
            "location": "Your Area",
            "time": "Now"
        })

    tips = []
    if condition == "Sunny" and temp < 35:
        tips.append("Good day for field inspection and pest monitoring")
    if condition == "Sunny" and wind < 10:
        tips.append("Low wind conditions — suitable for pesticide spraying")
    if rain > 0:
        tips.append("Skip irrigation today — natural rainfall is sufficient")
    if humidity > 75:
        tips.append("High humidity — watch for fungal diseases in crops")
    if temp > 33:
        tips.append("Water crops in the early morning or late evening to reduce evaporation")
    if not tips:
        tips.append("Regular monitoring recommended — conditions are normal")

    return {
        "recommendations": recommendations,
        "alerts": alerts,
        "farmingTips": tips
    }
