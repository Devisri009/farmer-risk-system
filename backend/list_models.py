import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def list_models():
    api_key = os.environ.get("GEMINI_API_KEY")
    
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        print("Listing models...")
        for m in client.models.list():
            print(f"Model: {m.name}, Methods: {m.supported_methods}")
        
    except Exception as e:
        print(f"Error occurred: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
