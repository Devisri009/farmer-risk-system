"""
WeatherAggregator - Phase 3 Enhanced Multi-Source Weather System
"""

import asyncio
import math
import time
import statistics
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

_agg_cache: Dict[str, tuple] = {}
CACHE_TTL_CURRENT = 20 * 60
CACHE_TTL_HISTORY = 60 * 60

SOURCES = {
    "Open-Meteo":  {"weight": 0.35},
    "ECMWF-IFS":   {"weight": 0.30},
    "NOAA-GFS":    {"weight": 0.15},
    "NASA-POWER":  {"weight": 0.10},
    "IMD-OGD":     {"weight": 0.10},
}

_IMD_DISTRICT_FORECAST_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"
_IMD_WARNINGS_RESOURCE = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
_OGD_BASE = "https://api.data.gov.in/resource"


def _weather_code_to_condition(code: int) -> str:
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


async def _fetch_open_meteo_model(lat: float, lon: float, model: Optional[str] = None) -> Optional[Dict]:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature",
        "hourly": "precipitation_probability",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max",
        "timezone": "auto",
        "forecast_days": 5,
    }
    if model:
        params["models"] = model
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code != 200:
                return None
            data = resp.json()
        current = data.get("current", {})
        hourly = data.get("hourly", {})
        daily = data.get("daily", {})
        rain_chance = 0
        if hourly.get("precipitation_probability"):
            rain_chance = hourly["precipitation_probability"][0] or 0
        forecast = []
        dates = daily.get("time", [])
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for i, date_str in enumerate(dates):
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            max_t = daily["temperature_2m_max"][i] if (i < len(daily.get("temperature_2m_max", [])) and daily["temperature_2m_max"][i] is not None) else 0
            min_t = daily["temperature_2m_min"][i] if (i < len(daily.get("temperature_2m_min", [])) and daily["temperature_2m_min"][i] is not None) else 0
            rain = daily["precipitation_sum"][i] if (i < len(daily.get("precipitation_sum", [])) and daily["precipitation_sum"][i] is not None) else 0
            wind = daily["wind_speed_10m_max"][i] if (i < len(daily.get("wind_speed_10m_max", [])) and daily["wind_speed_10m_max"][i] is not None) else 0
            code = daily["weather_code"][i] if (i < len(daily.get("weather_code", [])) and daily["weather_code"][i] is not None) else 0
            forecast.append({
                "day": day_names[dt.weekday()],
                "date": date_str,
                "temp": f"{int(max_t)}°C",
                "temp_max": round(float(max_t), 1),
                "temp_min": round(float(min_t), 1),
                "condition": _weather_code_to_condition(int(code)),
                "rainfall": round(float(rain), 1),
                "windSpeed": round(float(wind), 1),
            })
        
        cur_temp = current.get("temperature_2m")
        cur_feels = current.get("apparent_temperature")
        cur_humidity = current.get("relative_humidity_2m")
        cur_rain = current.get("precipitation")
        cur_wind = current.get("wind_speed_10m")
        cur_code = current.get("weather_code")

        return {
            "temperature": round(float(cur_temp), 1) if cur_temp is not None else None,
            "feels_like": round(float(cur_feels), 1) if cur_feels is not None else None,
            "humidity": round(float(cur_humidity), 1) if cur_humidity is not None else None,
            "rainfall": round(float(cur_rain), 2) if cur_rain is not None else 0.0,
            "rain_chance": rain_chance,
            "windSpeed": round(float(cur_wind), 1) if cur_wind is not None else None,
            "condition": _weather_code_to_condition(int(cur_code)) if cur_code is not None else "Cloudy",
            "forecast": forecast,
        }
    except Exception as e:
        print(f"[WeatherAgg] Open-Meteo (model={model}) error: {e}")
        return None


async def _fetch_nasa_power(lat: float, lon: float) -> Optional[Dict]:
    from datetime import timedelta
    end = datetime.today()
    start = end - timedelta(days=7)
    url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    params = {
        "latitude": lat, "longitude": lon,
        "parameters": "T2M,PRECTOTCORR,RH2M,WS2M",
        "community": "AG",
        "start": start.strftime("%Y%m%d"),
        "end": end.strftime("%Y%m%d"),
        "format": "JSON",
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code != 200:
                return None
            data = resp.json()
        weather = data["properties"]["parameter"]
        def latest_valid(d):
            for v in reversed(list(d.values())):
                if v != -999.0:
                    return float(v)
            return 0.0
        return {
            "temperature": round(latest_valid(weather.get("T2M", {})), 1),
            "humidity": round(latest_valid(weather.get("RH2M", {})), 1),
            "rainfall": round(latest_valid(weather.get("PRECTOTCORR", {})), 2),
            "windSpeed": round(latest_valid(weather.get("WS2M", {})), 1),
            "forecast": [],
        }
    except Exception as e:
        print(f"[WeatherAgg] NASA POWER error: {e}")
        return None


def _classify_imd_warning(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["cyclone", "depression", "storm surge"]):
        return "Cyclone Warning"
    elif any(w in t for w in ["heavy rain", "very heavy", "extremely heavy", "flood"]):
        return "Heavy Rainfall Warning"
    elif any(w in t for w in ["heat wave", "heatwave"]):
        return "Heat Wave Warning"
    elif any(w in t for w in ["cold wave", "frost"]):
        return "Cold Wave Warning"
    elif any(w in t for w in ["thunderstorm", "lightning", "squall"]):
        return "Thunderstorm Warning"
    elif any(w in t for w in ["fog", "mist", "haze"]):
        return "Dense Fog Advisory"
    elif any(w in t for w in ["wind", "gale", "gust"]):
        return "Strong Wind Warning"
    else:
        return "Weather Advisory"


def _imd_severity(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["extremely", "very heavy", "severe", "cyclone"]):
        return "High"
    elif any(w in t for w in ["heavy", "warning", "heat wave", "cold wave"]):
        return "Medium"
    else:
        return "Low"


async def _fetch_imd_ogd(district: str, state: str, api_key: str) -> Optional[Dict]:
    if not api_key:
        return None
    imd_alerts = []
    temp = humidity = rainfall = None
    try:
        url = f"{_OGD_BASE}/{_IMD_DISTRICT_FORECAST_RESOURCE}"
        params = {
            "api-key": api_key,
            "format": "json",
            "limit": 10,
            "filters[State_Name]": state or "Tamil Nadu",
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                records = resp.json().get("records", [])
                dist_lower = (district or "madurai").lower()
                for rec in records:
                    rec_dist = str(rec.get("District_Name", "")).lower()
                    if dist_lower in rec_dist or rec_dist in dist_lower:
                        try:
                            max_t = rec.get("Max_Temp") or rec.get("max_temp")
                            min_t = rec.get("Min_Temp") or rec.get("min_temp")
                            if max_t and min_t:
                                temp = (float(max_t) + float(min_t)) / 2
                        except (ValueError, TypeError):
                            pass
                        try:
                            rain_str = rec.get("Rainfall_Amount") or rec.get("rainfall")
                            if rain_str:
                                rainfall = float(rain_str)
                        except (ValueError, TypeError):
                            pass
                        warning = str(rec.get("Warning") or rec.get("weather_warning") or "").strip()
                        if warning and warning.lower() not in ("nil", "none", "no warning", "", "0"):
                            imd_alerts.append({
                                "id": f"imd-fcst-{len(imd_alerts)+1}",
                                "type": _classify_imd_warning(warning),
                                "severity": _imd_severity(warning),
                                "source": "IMD",
                                "description": f"IMD District Forecast: {warning} in {district or 'your district'}.",
                                "valid_until": None,
                            })
                        break
    except Exception as e:
        print(f"[WeatherAgg] IMD OGD forecast error: {e}")
    try:
        url = f"{_OGD_BASE}/{_IMD_WARNINGS_RESOURCE}"
        params = {
            "api-key": api_key,
            "format": "json",
            "limit": 5,
            "filters[State]": state or "Tamil Nadu",
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                records = resp.json().get("records", [])
                for rec in records:
                    warning_text = str(
                        rec.get("Warning_Text") or rec.get("Phenomenon") or
                        rec.get("warning_text") or rec.get("phenomena") or ""
                    ).strip()
                    if warning_text:
                        imd_alerts.append({
                            "id": f"imd-warn-{len(imd_alerts)+1}",
                            "type": _classify_imd_warning(warning_text),
                            "severity": _imd_severity(warning_text),
                            "source": "IMD",
                            "description": f"IMD Warning: {warning_text}",
                            "valid_until": rec.get("Valid_Till") or rec.get("valid_till"),
                        })
    except Exception as e:
        print(f"[WeatherAgg] IMD OGD warnings error: {e}")
    return {
        "temperature": temp,
        "humidity": humidity,
        "rainfall": rainfall,
        "windSpeed": None,
        "forecast": [],
        "imd_alerts": imd_alerts,
    }


def _weighted_consensus(results: Dict[str, Optional[Dict]], fields: List[str]) -> Dict[str, float]:
    totals = {f: 0.0 for f in fields}
    weight_sum = {f: 0.0 for f in fields}
    for source_name, data in results.items():
        if data is None:
            continue
        w = SOURCES[source_name]["weight"]
        for f in fields:
            val = data.get(f)
            try:
                fval = float(val) if val is not None else None
                if fval is not None:
                    totals[f] += fval * w
                    weight_sum[f] += w
            except (ValueError, TypeError):
                pass
    consensus = {}
    for f in fields:
        if weight_sum[f] > 0:
            consensus[f] = round(totals[f] / weight_sum[f], 2)
        else:
            consensus[f] = 0.0
    return consensus


def _compute_confidence(results: Dict[str, Optional[Dict]]) -> tuple:
    active = [name for name, d in results.items() if d is not None]
    n = len(active)
    if n == 0:
        return 0, "No Data"
    temps = []
    for name in active:
        t = results[name].get("temperature")
        if t is not None:
            try:
                temps.append(float(t))
            except (ValueError, TypeError):
                pass
    base_score = (n / len(SOURCES)) * 70
    if len(temps) >= 2:
        spread = statistics.stdev(temps)
        agreement_pts = max(0, 30 - (spread * 3))
    elif len(temps) == 1:
        agreement_pts = 20
    else:
        agreement_pts = 0
    score = int(min(100, base_score + agreement_pts))
    if score >= 80:
        label = "High"
    elif score >= 60:
        label = "Moderate"
    else:
        label = "Low"
    return score, label


async def aggregate(
    lat: float,
    lon: float,
    district: str = "Madurai",
    state: str = "Tamil Nadu",
    ogd_api_key: str = "",
) -> Dict[str, Any]:
    cache_key = f"agg_{lat:.2f}_{lon:.2f}"
    if cache_key in _agg_cache:
        cached, ts = _agg_cache[cache_key]
        if time.time() - ts < CACHE_TTL_CURRENT:
            return cached

    results_raw = await asyncio.gather(
        _fetch_open_meteo_model(lat, lon, model=None),
        _fetch_open_meteo_model(lat, lon, model="ecmwf_ifs04"),
        _fetch_open_meteo_model(lat, lon, model="gfs_global"),
        _fetch_nasa_power(lat, lon),
        _fetch_imd_ogd(district, state, ogd_api_key),
        return_exceptions=False,
    )

    source_names = list(SOURCES.keys())
    results: Dict[str, Optional[Dict]] = {}
    for i, name in enumerate(source_names):
        r = results_raw[i]
        results[name] = r if isinstance(r, dict) else None

    numeric_fields = ["temperature", "humidity", "rainfall", "windSpeed"]
    consensus = _weighted_consensus(results, numeric_fields)

    forecast = []
    for src in ["Open-Meteo", "ECMWF-IFS", "NOAA-GFS"]:
        if results.get(src) and results[src].get("forecast"):
            forecast = results[src]["forecast"]
            break

    condition = "Cloudy"
    for src in ["Open-Meteo", "ECMWF-IFS", "NOAA-GFS"]:
        if results.get(src) and results[src].get("condition"):
            condition = results[src]["condition"]
            break

    rain_chances = [
        results[s].get("rain_chance", 0)
        for s in ["Open-Meteo", "ECMWF-IFS", "NOAA-GFS"]
        if results.get(s) and results[s].get("rain_chance") is not None
    ]
    rain_chance = int(sum(rain_chances) / len(rain_chances)) if rain_chances else 0

    feels_like = (results.get("Open-Meteo") or {}).get("feels_like", consensus["temperature"])

    imd_result = results.get("IMD-OGD")
    imd_alerts = imd_result.get("imd_alerts", []) if imd_result else []

    sources_used = [name for name, d in results.items() if d is not None]
    confidence_score, source_agreement = _compute_confidence(results)

    agg_result = {
        "temperature": consensus["temperature"] or 30.0,
        "feels_like": round(float(feels_like), 1),
        "humidity": consensus["humidity"] or 65.0,
        "rainfall": consensus["rainfall"],
        "windSpeed": consensus["windSpeed"] or 0.0,
        "rain_chance": rain_chance,
        "condition": condition,
        "forecast": forecast,
        "confidence_score": confidence_score,
        "source_agreement": source_agreement,
        "sources_used": sources_used,
        "imd_alerts": imd_alerts,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    _agg_cache[cache_key] = (agg_result, time.time())
    return agg_result


def _source_display(name: str) -> str:
    return {
        "Open-Meteo": "Open-Meteo",
        "ECMWF-IFS": "ECMWF IFS",
        "NOAA-GFS": "NOAA GFS",
        "NASA-POWER": "NASA POWER",
        "IMD-OGD": "IMD Official",
    }.get(name, name)


def _source_description(name: str) -> str:
    return {
        "Open-Meteo": "Real-time global forecast (primary)",
        "ECMWF-IFS": "European Centre NWP cross-validation",
        "NOAA-GFS": "US National Weather Service GFS model",
        "NASA-POWER": "Historical climate baseline (7-day)",
        "IMD-OGD": "India Meteorological Dept. official district warnings",
    }.get(name, "")


async def get_source_status(
    lat: float = 9.925,
    lon: float = 78.119,
    district: str = "Madurai",
    state: str = "Tamil Nadu",
    ogd_api_key: str = ""
) -> List[Dict]:
    cache_key = f"agg_{lat:.2f}_{lon:.2f}"
    if cache_key in _agg_cache:
        cached, ts = _agg_cache[cache_key]
        sources_used = cached.get("sources_used", [])
        age_min = int((time.time() - ts) / 60)
        return [
            {
                "name": name,
                "display_name": _source_display(name),
                "status": "live" if name in sources_used else "unavailable",
                "weight": SOURCES[name]["weight"],
                "data_age_minutes": age_min if name in sources_used else None,
                "description": _source_description(name),
            }
            for name in SOURCES
        ]
    await aggregate(lat, lon, district, state, ogd_api_key)
    return await get_source_status(lat, lon, district, state, ogd_api_key)
