import os
from ..ai_service import ask_assistant

async def get_ai_market_recommendation(crop: str, current_price: float, trend: str, mandi: str) -> str:
    prompt = f"""
    The current mandi price for {crop} in {mandi} is ₹{current_price}.
    The price trend is {trend}.
    Generate a short 1-2 sentence recommendation for a farmer in Tamil Nadu.
    Advise them on whether it is a good time to sell or hold based on typical market cycles.
    Be encouraging but professional. Support both English and Tamil if possible.
    """
    try:
        reply = await ask_assistant(prompt, "English")
        return reply
    except Exception as e:
        print(f"AI Market Insight Error: {e}")
        return f"{crop} prices are currently stable in {mandi}. Consider monitoring market trends over the next 3 days."
