"""
@author Surya Sushad <suryasushad@icloud.com>
@copyright 2026 Surya Sushad. All rights reserved.
"""

import asyncio
import websockets
import json
import os

API_KEY = os.environ.get("VITE_GEMINI_API_KEY", "")

async def test_connect(api_version, model_name):
    if not API_KEY:
        print("Please set VITE_GEMINI_API_KEY in your environment.")
        return
    url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.{api_version}.GenerativeService.BidiGenerateContent?key={API_KEY}"
    try:
        async with websockets.connect(url) as ws:
            setup = {
                "setup": {
                    "model": model_name,
                    "generationConfig": {"responseModalities": ["AUDIO"]}
                }
            }
            await ws.send(json.dumps(setup))
            response = await ws.recv()
            print(f"SUCCESS {api_version} {model_name}: {response[:100]}")
    except Exception as e:
        print(f"FAILED {api_version} {model_name}: {e}")

async def main():
    models = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-flash-preview-tts",
        "models/gemini-3.1-flash-tts-preview",
        "models/gemini-2.5-pro",
        "models/gemini-3.8-flash"
    ]
    for model in models:
        await test_connect("v1alpha", model)
        await test_connect("v1beta", model)

if __name__ == "__main__":
    asyncio.run(main())
