# test_gemini_models.py
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv
import os

# Load your API key
env_path = Path(__file__).resolve().parent / 'env' / 'gemini_api_key.env'
load_dotenv(env_path)

api_key = os.environ.get('GOOGLE_API_KEY')
print(f"API Key loaded: {'Yes' if api_key else 'No'}")

genai.configure(api_key=api_key)

# List all available models
print("\n📋 Available models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"  ✅ {model.name}")
        print(f"     Display name: {model.display_name}")
        print(f"     Description: {model.description[:100]}...")
        print()