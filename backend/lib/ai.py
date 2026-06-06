import os
import json
import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

# AI Clients initialization
openai_client = None
if os.environ.get("OPENAI_API_KEY"):
    openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

anthropic_client = None
if os.environ.get("ANTHROPIC_API_KEY"):
    anthropic_client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

gemini_configured = False
if os.environ.get("GOOGLE_API_KEY"):
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
    gemini_configured = True

def get_ai_response(system_prompt, user_message, model="gemini-1.5-flash"):
    # 1. Gemini (Google) - Priority if GOOGLE_API_KEY is set
    if gemini_configured:
        try:
            model_instance = genai.GenerativeModel(
                model_name=model,
                system_instruction=system_prompt
            )
            
            # For JSON response, we append a instruction if not present
            generation_config = {}
            if "JSON" in system_prompt:
                generation_config["response_mime_type"] = "application/json"
            
            response = model_instance.generate_content(
                user_message,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            return f"Gemini Error: {str(e)}"

    # 2. OpenAI - Fallback
    elif openai_client:
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                response_format={ "type": "json_object" } if "JSON" in system_prompt else None
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

    # 3. Anthropic (Claude) - Fallback
    elif anthropic_client:
        try:
            response = anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            return response.content[0].text
        except Exception as e:
            return f"Anthropic Error: {str(e)}"

    return "AI API key not configured. Please set GOOGLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY."
