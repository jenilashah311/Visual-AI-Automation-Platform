import time
from typing import Any

import httpx

from app.config import settings
from app.nodes.base import BaseNode, NodeResult


class LLMNode(BaseNode):
    """LLM node via Groq (OpenAI-compatible API). Keys start with gsk_."""

    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        start = time.time()
        try:
            if not settings.groq_api_key:
                raise ValueError(
                    "GROQ_API_KEY is not set. Add your key to backend/.env"
                )

            input_value = str(self._get_first_input(inputs))
            prompt = str(self.data.get("prompt", "")).replace("{{input}}", input_value)
            model = self.data.get("model", "llama-3.3-70b-versatile")
            max_tokens = int(self.data.get("max_tokens", 1000))
            system_prompt = self.data.get("system_prompt")

            messages: list[dict[str, str]] = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{settings.groq_base_url.rstrip('/')}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.groq_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": max_tokens,
                    },
                )
                response.raise_for_status()
                data = response.json()

            output = data["choices"][0]["message"]["content"]

            duration_ms = int((time.time() - start) * 1000)
            return NodeResult(
                output=output,
                status="completed",
                error=None,
                duration_ms=duration_ms,
            )
        except httpx.HTTPStatusError as e:
            detail = e.response.text[:500] if e.response else str(e)
            duration_ms = int((time.time() - start) * 1000)
            return NodeResult(
                output=None,
                status="failed",
                error=f"Groq API error ({e.response.status_code}): {detail}",
                duration_ms=duration_ms,
            )
        except Exception as e:
            duration_ms = int((time.time() - start) * 1000)
            return NodeResult(
                output=None,
                status="failed",
                error=str(e),
                duration_ms=duration_ms,
            )
