import time
from typing import Any

from app.config import settings
from app.nodes.base import BaseNode, NodeResult


class WebSearchNode(BaseNode):
    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        start = time.time()
        try:
            from tavily import TavilyClient

            input_value = str(self._get_first_input(inputs))
            query_template = str(self.data.get("query_template", "{{input}}"))
            query = query_template.replace("{{input}}", input_value)

            client = TavilyClient(api_key=settings.tavily_api_key)
            response = client.search(query=query, max_results=3)

            results = response.get("results", [])
            formatted_parts = []
            for r in results[:3]:
                formatted_parts.append(
                    f"{r.get('title', '')}\n{r.get('url', '')}\n{r.get('content', r.get('snippet', ''))}\n---"
                )
            output = "\n".join(formatted_parts) if formatted_parts else "No results found"

            duration_ms = int((time.time() - start) * 1000)
            return NodeResult(
                output=output,
                status="completed",
                error=None,
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


class CodeExecutorNode(BaseNode):
    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        start = time.time()
        try:
            import os

            from e2b_code_interpreter import Sandbox

            os.environ.setdefault("E2B_API_KEY", settings.e2b_api_key)

            input_value = str(self._get_first_input(inputs))
            code = str(self.data.get("code", "")).replace("{{input}}", input_value)

            with Sandbox.create() as sandbox:
                execution = sandbox.run_code(code)

                if execution.error:
                    duration_ms = int((time.time() - start) * 1000)
                    return NodeResult(
                        output=execution.text or "",
                        status="failed",
                        error=str(execution.error),
                        duration_ms=duration_ms,
                    )

                duration_ms = int((time.time() - start) * 1000)
                return NodeResult(
                    output=execution.text or "Code executed successfully (no output)",
                    status="completed",
                    error=None,
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
