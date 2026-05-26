import time
from typing import Any

from app.nodes.base import BaseNode, NodeResult


class OutputNode(BaseNode):
    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        start = time.time()
        output = self._get_first_input(inputs)
        duration_ms = int((time.time() - start) * 1000)
        return NodeResult(
            output=output,
            status="completed",
            error=None,
            duration_ms=duration_ms,
        )
