from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class NodeResult:
    output: Any
    status: str  # "completed" | "failed"
    error: str | None
    duration_ms: int


class BaseNode(ABC):
    def __init__(self, node_id: str, node_data: dict):
        self.node_id = node_id
        self.data = node_data

    @abstractmethod
    async def execute(self, inputs: dict[str, Any]) -> NodeResult:
        pass

    def _get_first_input(self, inputs: dict[str, Any]) -> Any:
        if not inputs:
            return ""
        return next(iter(inputs.values()))
