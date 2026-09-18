import httpx
import time
from datetime import datetime, timedelta

_climate_cache = {}
CACHE_TTL = 3600  # 1 hour

async def get_climate_data(lat: float, lon: float):
    """
    Fetches historical climate data from NASA POWER API.
    Used for risk calculation and climate display.
    """
    cache_key = f"{lat}_{lon}"
    if cache_key in _climate_cache:
        cached_data, timestamp = _climate_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return cached_data

    # Fetch last 7 days of data
    end_date = datetime.today()
    start_date = end_date - timedelta(days=7)

    start = start_date.strftime("%Y%m%d")
    end = end_date.strftime("%Y%m%d")

    url = "https://power.larc.nasa.gov/api/temporal/daily/point"

    params = {
        "latitude": lat,
        "longitude": lon,
        "parameters": "T2M,PRECTOTCORR,RH2M,WS2M",
        "community": "AG",
        "start": start,
        "end": end,
        "format": "JSON"
    }

    try:
        # Using httpx for async non-blocking requests
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        weather = data["properties"]["parameter"]

        def get_latest_valid(data_dict):
            for date, value in reversed(data_dict.items()):
                if value != -999.0:
                    return value
            return 0.0

        result = {
            "temperature": get_latest_valid(weather.get("T2M", {})),
            "rainfall": get_latest_valid(weather.get("PRECTOTCORR", {})),
            "humidity": get_latest_valid(weather.get("RH2M", {})),
            "windSpeed": get_latest_valid(weather.get("WS2M", {}))
        }
        
        # Update cache
        _climate_cache[cache_key] = (result, time.time())
        return result
    except Exception as e:
        print(f"Climate API Fetch Error: {e}")
        # Return fallback data to keep the app functional
        return {
            "temperature": 30.5,
            "rainfall": 0.0,
            "humidity": 60.0,
            "windSpeed": 8.0
        }