import os
import json
from openai import OpenAI
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
anthropic_client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def get_ai_response(system_prompt, user_message, model="gpt-4o-mini"):
    if os.environ.get("OPENAI_API_KEY"):
        response = openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            response_format={ "type": "json_object" } if "JSON" in system_prompt else None
        )
        return response.choices[0].message.content
    elif os.environ.get("ANTHROPIC_API_KEY"):
        # Claude Haiku implementation
        response = anthropic_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        return response.content[0].text
    return "AI API key not configured."
