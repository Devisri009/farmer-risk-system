"""
Open-Meteo Weather Service
Provides real-time weather data (matches Google Weather accuracy).
Uses Open-Meteo API — free, no API key required.
"""

import httpx
import time
from datetime import datetime

_weather_cache = {}
CACHE_TTL = 900  # 15 minutes — weather data is refreshed frequently


async def get_current_weather(lat: float, lon: float) -> dict:
    """
    Fetches real-time current weather from Open-Meteo API.
    Returns temperature, humidity, wind speed, rainfall, and weather condition.
    """
    cache_key = f"current_{lat}_{lon}"
    if cache_key in _weather_cache:
        cached_data, timestamp = _weather_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature",
        "hourly": "precipitation_probability",
        "timezone": "auto",
        "forecast_days": 1
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        current = data.get("current", {})
        hourly = data.get("hourly", {})
        
        # Get probability for the current hour
        rain_chance = 0
        if "precipitation_probability" in hourly and len(hourly["precipitation_probability"]) > 0:
            # We take the 0th index for the current hour
            rain_chance = hourly["precipitation_probability"][0]

        result = {
            "temperature": round(current.get("temperature_2m", 0), 1),
            "feels_like": round(current.get("apparent_temperature", 0), 1),
            "humidity": round(current.get("relative_humidity_2m", 0), 1),
            "rainfall": round(current.get("precipitation", 0), 1),
            "rain_chance": rain_chance,
            "windSpeed": round(current.get("wind_speed_10m", 0), 1),
            "weather_code": current.get("weather_code", 0),
            "condition": _weather_code_to_condition(current.get("weather_code", 0)),
            "timestamp": current.get("time", ""),
        }

        _weather_cache[cache_key] = (result, time.time())
        return result

    except Exception as e:
        print(f"Open-Meteo Current Weather Error: {e}")
        return {
            "temperature": 0,
            "feels_like": 0,
            "humidity": 0,
            "rainfall": 0,
            "windSpeed": 0,
            "weather_code": -1,
            "condition": "Unknown",
            "timestamp": "",
            "error": str(e)
        }


async def get_forecast(lat: float, lon: float, days: int = 5) -> list:
    """
    Fetches multi-day weather forecast from Open-Meteo API.
    Returns daily highs, lows, conditions, and precipitation.
    """
    cache_key = f"forecast_{lat}_{lon}_{days}"
    if cache_key in _weather_cache:
        cached_data, timestamp = _weather_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
        "timezone": "auto",
        "forecast_days": days
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        daily = data.get("daily", {})
        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precip = daily.get("precipitation_sum", [])
        codes = daily.get("weather_code", [])
        winds = daily.get("wind_speed_10m_max", [])

        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        result = []

        for i in range(len(dates)):
            dt = datetime.strptime(dates[i], "%Y-%m-%d")
            day_name = day_names[dt.weekday()]
            condition = _weather_code_to_condition(codes[i] if i < len(codes) else 0)
            max_t = round(max_temps[i], 0) if i < len(max_temps) else 0
            min_t = round(min_temps[i], 0) if i < len(min_temps) else 0
            rain = round(precip[i], 1) if i < len(precip) else 0
            wind = round(winds[i], 1) if i < len(winds) else 0

            result.append({
                "day": day_name,
                "date": dates[i],
                "temp": f"{int(max_t)}°C",
                "temp_max": max_t,
                "temp_min": min_t,
                "condition": condition,
                "rainfall": rain,
                "windSpeed": wind,
            })

        _weather_cache[cache_key] = (result, time.time())
        return result

    except Exception as e:
        print(f"Open-Meteo Forecast Error: {e}")
        return []


def _weather_code_to_condition(code: int) -> str:
    """
    Converts WMO weather interpretation codes to human-readable conditions.
    Reference: https://open-meteo.com/en/docs
    """
    if code == 0:
        return "Sunny"
    elif code in (1, 2, 3):
        return "Cloudy"
    elif code in (45, 48):
        return "Foggy"
    elif code in (51, 53, 55, 56, 57):
        return "Drizzle"
    elif code in (61, 63, 65, 66, 67):
        return "Rainy"
    elif code in (71, 73, 75, 77):
        return "Snowy"
    elif code in (80, 81, 82):
        return "Showers"
    elif code in (85, 86):
        return "Snow Showers"
    elif code in (95, 96, 99):
        return "Stormy"
    else:
        return "Cloudy"


async def get_aggregated_weather(lat: float, lon: float, district: str = "", state: str = "", ogd_api_key: str = "") -> dict:
    """
    Convenience wrapper to get multi-source consensus weather.
    Delegates to services.weather_aggregator.
    """
    from .services import weather_aggregator
    return await weather_aggregator.aggregate(lat=lat, lon=lon, district=district, state=state, ogd_api_key=ogd_api_key)
