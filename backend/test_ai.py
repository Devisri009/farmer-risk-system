import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        # Matches current ai_service.py usage
        print("Sending test request to Gemini with model 'gemini-flash-latest'...")
        response = await client.aio.models.generate_content(
            model='gemini-flash-latest', 
            contents="Say 'System Online' if you can read this.",
        )
        print(f"Response: {response.text.strip()}")
        
    except Exception as e:
        print(f"Error occurred: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
