import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_KEY", "")

# 명시적으로 클라이언트 생성 시도
if not url or not key:
    print("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing!")
    supabase = None
else:
    try:
        supabase: Client = create_client(url, key)
        print("Supabase client initialized successfully.")
    except Exception as e:
        print(f"FAILED to initialize Supabase client: {str(e)}")
        supabase = None
