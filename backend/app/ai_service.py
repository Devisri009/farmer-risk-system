import os
import json
import logging
import asyncio
import httpx
from typing import Any, Dict, List, Optional, Tuple, Union

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

# --- Multi-Key Rotation & Caching ---
_ai_cache = {}
CACHE_TTL = 3600

_genai_keys = [
    os.environ.get("GEMINI_API_KEY"),
    os.environ.get("GEMINI_API_KEY_1"),
    os.environ.get("GEMINI_API_KEY_2"),
    os.environ.get("GEMINI_API_KEY_3")
]
_genai_keys = [k for k in _genai_keys if k and len(k) > 10]
_current_key_index = 0

def get_cached_response(key: str):
    import time
    if key in _ai_cache:
        entry = _ai_cache[key]
        if time.time() - entry["timestamp"] < CACHE_TTL:
            return entry["response"]
    return None

def set_cached_response(key: str, response):
    import time
    _ai_cache[key] = {"response": response, "timestamp": time.time()}

# --- Database Wisdom (Persistent Caching) ---
def check_db_wisdom(key: str, category: str = 'general'):
    """Check if we already solved this in our own database"""
    try:
        from .database import SessionLocal
        from .models import AIVisdom
        db = SessionLocal()
        # Use simple key matching
        wisdom = db.query(AIVisdom).filter(AIVisdom.question_key == key, AIVisdom.category == category).first()
        db.close()
        if wisdom:
            return wisdom.answer
    except Exception as e:
        logger.error(f"DB Wisdom check failed: {e}")
    return None

def save_db_wisdom(key: str, answer: Union[str, Dict[str, Any]], language: str = 'en', category: str = 'general') -> None:
    """Save AI answer to database so we never have to pay for it again"""
    try:
        from .database import SessionLocal
        from .models import AIVisdom
        db = SessionLocal()
        # Ensure we don't save duplicates
        existing = db.query(AIVisdom).filter(AIVisdom.question_key == key, AIVisdom.category == category).first()
        if not existing:
            # If answer is dict (rules), convert to JSON string
            if isinstance(answer, dict):
                answer = json.dumps(answer)
                
            wisdom = AIVisdom(question_key=key, answer=answer, language=language, category=category)
            db.add(wisdom)
            db.commit()
        db.close()
    except Exception as e:
        logger.error(f"DB Wisdom save failed: {e}")
# --------------------------------------------
async def call_gemini_with_rotation(prompt: str, model_name: str = 'gemini-3.6-flash') -> Tuple[Optional[str], Optional[str]]:
    """
    Tries to generate content using the current key.
    If it hits a 429 (quota), it rotates to the NEXT key and retries until all keys are exhausted.
    """
    global _current_key_index
    from google import genai
    
    if not _genai_keys:
        return None, "No API keys found in .env"

    attempts = 0
    max_attempts = len(_genai_keys)
    
    while attempts < max_attempts:
        current_key = _genai_keys[_current_key_index]
        try:
            client = genai.Client(api_key=current_key)
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return response.text.strip(), None
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                logger.warning(f"Key index {_current_key_index} reached quota. Rotating...")
                _current_key_index = (_current_key_index + 1) % len(_genai_keys)
                attempts += 1
                await asyncio.sleep(0.5) 
            else:
                logger.error(f"Gemini call failed (Non-quota error): {e}")
                # Rotate even on error to see if another key works
                _current_key_index = (_current_key_index + 1) % len(_genai_keys)
                attempts += 1
                
    return None, "QUOTA_EXHAUSTED_ALL_KEYS"

async def call_groq(prompt: str, model_name: str = "openai/gpt-oss-20b") -> Tuple[Optional[str], Optional[str]]:
    """
    Ultra-fast LLM inference via Groq LPU API.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or len(api_key) < 10:
        return None, "Groq key missing"

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try models in order of best fit
    candidate_models = [model_name, "groq/compound-mini", "qwen/qwen3.6-27b"]
    
    for candidate in candidate_models:
        data = {
            "model": candidate,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.6
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, headers=headers, json=data)
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content'].strip()
                    # Strip <think>...</think> if model output contains reasoning tokens
                    if "<think>" in content and "</think>" in content:
                        import re
                        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
                    return content, None
                else:
                    logger.warning(f"Groq ({candidate}) returned {response.status_code}: {response.text[:100]}")
        except Exception as e:
            logger.warning(f"Groq ({candidate}) call failed: {e}")
            
    return None, "Groq calls failed"

async def call_openrouter(prompt: str, model_name: str = "google/gemini-2.5-flash") -> Tuple[Optional[str], Optional[str]]:
    """
    Tries to generate content using OpenRouter API.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key or "PASTE" in api_key:
        return None, "OpenRouter key missing"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://farmvista.app",
        "X-Title": "FarmVista",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(url, headers=headers, json=data)
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip(), None
            else:
                return None, f"OpenRouter returned {response.status_code}"
    except Exception as e:
        logger.warning(f"OpenRouter call failed: {e}")
        return None, str(e)
    
    return None, "Unexpected error in OpenRouter"

async def generate_ai_response(prompt: str, gemini_model: str = 'gemini-3.6-flash') -> Tuple[Optional[str], Optional[str]]:
    """
    The Unified Multi-Tier "Universal Brain":
    1. Groq (Ultra-fast LPU inference)
    2. Gemini Rotation (4 active keys on gemini-3.6-flash)
    3. OpenRouter (Fallback)
    """
    # ⚡ Attempt 1: Groq (Blazing fast)
    groq_resp, groq_err = await call_groq(prompt)
    if groq_resp:
        logger.info("Universal Brain: Groq succeeded")
        return groq_resp, None

    # 🔄 Attempt 2: 4-Key Gemini Rotation
    logger.info(f"Universal Brain: Falling back to Gemini Rotation (keys: {len(_genai_keys)})...")
    gem_resp, gem_err = await call_gemini_with_rotation(prompt, model_name=gemini_model)
    if gem_resp:
        logger.info("Universal Brain: Gemini rotation succeeded")
        return gem_resp, None

    # 🌐 Attempt 3: OpenRouter
    logger.info("Universal Brain: Falling back to OpenRouter...")
    return await call_openrouter(prompt)
# -------------------------------------------------------------

async def get_dynamic_crop_rules(crop_name: str):
    """
    Fetch optimal climate conditions for an unknown crop.
    Uses rotation and caching.
    """
    # 1. Check RAM Cache
    cache_key = f"crop_rules_{crop_name.lower()}"
    cached = get_cached_response(cache_key)
    if cached:
        return cached

    # 2. Check Database Cache
    db_cached = check_db_wisdom(cache_key, category='crop_rules')
    if db_cached:
        try:
            res = json.loads(db_cached)
            set_cached_response(cache_key, res) # Update RAM
            return res
        except: pass

    prompt = f"""
    Provide the threshold climate risk conditions for growing the crop "{crop_name}".
    Return ONLY a raw JSON object containing exactly these three numeric keys:
    "max_temp": (max temp in Celsius),
    "min_rain": (min weekly rainfall in mm),
    "max_rain": (max weekly rainfall in mm).
    """
    
    response_text, error = await generate_ai_response(prompt)
    
    if response_text:
        try:
            text = response_text
            if text.startswith('```json'): text = text[7:]
            if text.startswith('```'): text = text[3:]
            if text.endswith('```'): text = text[:-3]
                
            data = json.loads(text.strip())
            result = {
                "max_temp": float(data.get("max_temp", 36)),
                "min_rain": float(data.get("min_rain", -1)),
                "max_rain": float(data.get("max_rain", 60))
            }
            set_cached_response(cache_key, result)
            save_db_wisdom(cache_key, result, category='crop_rules') # Save to DB
            return result
        except Exception as e:
            logger.error(f"JSON parse failed for crop '{crop_name}': {e}")
    else:
        logger.error(f"Crop rules AI failure: {error}")
    
    return { "max_temp": 35, "min_rain": 10, "max_rain": 50 } # Fallback

async def ask_assistant(message: str, language: str = 'en'):
    """
    Answer farming and app related questions with rotation support.
    """
    # 1. Check RAM Cache
    message_short = message[:40] if message else "empty"
    cache_key = f"ask_{language}_{message_short.lower()}"
    cached = get_cached_response(cache_key)
    if cached:
        return cached
    
    # 2. Check Database Cache
    db_cached = check_db_wisdom(cache_key, category='assistant')
    if db_cached:
        set_cached_response(cache_key, db_cached) # Update RAM
        return db_cached

    system_prompt = """
    You are the FarmVista AI Assistant. FarmVista is a blockchain-based agricultural marketplace app.
    Your job is to answer questions about farming, market prices, and crop management.
    Be helpful, concise, and professional. Match the user's language/style (English/Tamil/Tanglish).
    """
    if language == 'ta':
        system_prompt += "\nRespond in Tamil."
    
    full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"

    reply_text, error = await generate_ai_response(full_prompt)
    
    if error:
        if "QUOTA_EXHAUSTED" in error:
            if language == 'ta':
                return "மன்னிக்கவும், அனைத்து AI சாவிகளும் (API Keys) தற்போது கோட்டா முடிந்துவிட்டன. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
            return "I have reached the daily limit on all my AI keys. Please try again after some time!"
        return "I'm having a technical issue connecting to my brain. Please try again later."

    if reply_text:
        set_cached_response(cache_key, reply_text)
        save_db_wisdom(cache_key, reply_text, language=language, category='assistant') # Save to DB
    return reply_text or ( "மன்னிக்கவும், AI தற்போது கிடைக்கவில்லை." if language == 'ta' else "I'm sorry, I cannot think clearly right now." )
