import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_all_models():
    api_key = os.environ.get("GEMINI_API_KEY")
    # Trying models with explicit 'models/' prefix or older names
    models_to_test = ['gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-pro', 'gemini-1.0-pro']
    
    from google import genai
    client = genai.Client(api_key=api_key)
    
    for model_name in models_to_test:
        print(f"--- Testing {model_name} ---")
        try:
            response = await client.aio.models.generate_content(
                model=model_name, 
                contents="Hi",
            )
            print(f"SUCCESS with {model_name}: {response.text.strip()}")
            return model_name
        except Exception as e:
            print(f"FAILED {model_name}: {e}")
            
    return None

if __name__ == "__main__":
    asyncio.run(test_all_models())
