import os
import asyncio
from dotenv import load_dotenv

# Force reload of .env
load_dotenv(override=True)

async def test_rotation():
    keys = [
        os.environ.get("GEMINI_API_KEY"),
        os.environ.get("GEMINI_API_KEY_1"),
        os.environ.get("GEMINI_API_KEY_2"),
        os.environ.get("GEMINI_API_KEY_3")
    ]
    
    from google import genai
    
    for i, key in enumerate(keys):
        print(f"--- Testing Key {i} ({key[:10]}...) ---")
        if not key or len(key) < 10:
            print(f"Key {i} is missing or invalid.")
            continue
            
        try:
            client = genai.Client(api_key=key)
            response = await client.aio.models.generate_content(
                model='gemini-2.0-flash', 
                contents="Hi",
            )
            print(f"Key {i} is WORKING: {response.text.strip()}")
        except Exception as e:
            print(f"Key {i} FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_rotation())
