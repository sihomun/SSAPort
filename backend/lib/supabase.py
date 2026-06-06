import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_KEY", "")

# 환경 변수가 없을 경우 에러를 내지 않고 None을 반환하거나 
# 실제 호출 시점에 에러가 나도록 안전하게 처리합니다.
supabase: Client = None
if url and key:
    supabase = create_client(url, key)
else:
    print("Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing.")
