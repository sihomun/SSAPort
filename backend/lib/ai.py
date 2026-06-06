import os

import google.generativeai as genai
from anthropic import Anthropic
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-3-haiku-20240307")

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


def _wants_json(system_prompt):
    return "JSON" in system_prompt or "json" in system_prompt


def _get_gemini_response(system_prompt, user_message, model):
    model_instance = genai.GenerativeModel(
        model_name=model,
        system_instruction=system_prompt,
    )

    generation_config = {}
    if _wants_json(system_prompt):
        generation_config["response_mime_type"] = "application/json"

    response = model_instance.generate_content(
        user_message,
        generation_config=generation_config,
    )
    return response.text


def _get_openai_response(system_prompt, user_message):
    kwargs = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    }
    if _wants_json(system_prompt):
        kwargs["response_format"] = {"type": "json_object"}

    response = openai_client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


def _get_anthropic_response(system_prompt, user_message):
    response = anthropic_client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def get_ai_response(system_prompt, user_message, model=None):
    errors = []

    if gemini_configured:
        try:
            return _get_gemini_response(system_prompt, user_message, model or GEMINI_MODEL)
        except Exception as exc:
            errors.append(f"Gemini: {exc}")

    if openai_client:
        try:
            return _get_openai_response(system_prompt, user_message)
        except Exception as exc:
            errors.append(f"OpenAI: {exc}")

    if anthropic_client:
        try:
            return _get_anthropic_response(system_prompt, user_message)
        except Exception as exc:
            errors.append(f"Anthropic: {exc}")

    if errors:
        return "AI 응답 생성 중 오류가 발생했습니다. " + " | ".join(errors)

    return "AI API key not configured. Please set GOOGLE_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY."
