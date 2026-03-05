import requests
from datetime import datetime, timedelta


def get_climate_data(lat: float, lon: float):

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

    response = requests.get(url, params=params)
    data = response.json()

    weather = data["properties"]["parameter"]

    temperature = weather["T2M"]
    rainfall = weather["PRECTOTCORR"]
    humidity = weather["RH2M"]
    wind = weather["WS2M"]

    return {
        "temperature": list(temperature.values())[-1],
        "rainfall": list(rainfall.values())[-1],
        "humidity": list(humidity.values())[-1],
        "windSpeed": list(wind.values())[-1]
    }