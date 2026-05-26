import time
from typing import Any

from app.nodes.base import BaseNode, NodeResult


class ConditionNode(BaseNode):
    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        start = time.time()
        try:
            input_value = self._get_first_input(inputs)
            condition = str(self.data.get("condition", "True"))
            true_label = self.data.get("true_label", "true")
            false_label = self.data.get("false_label", "false")

            result = bool(
                eval(
                    condition,
                    {"__builtins__": {}},
                    {"input": input_value},
                )
            )

            branch = true_label if result else false_label
            duration_ms = int((time.time() - start) * 1000)
            return NodeResult(
                output={"branch": branch, "value": input_value},
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
