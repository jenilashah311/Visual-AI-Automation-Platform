import time
from collections.abc import Awaitable, Callable
from typing import Any

from app.core import dag
from app.core.state_store import StateStore
from app.nodes.base import NodeResult
from app.nodes.condition_node import ConditionNode
from app.nodes.llm_node import LLMNode
from app.nodes.output_node import OutputNode
from app.nodes.tool_node import CodeExecutorNode, WebSearchNode
from app.schemas.workflow import GraphJSON

NODE_TYPE_MAP = {
    "llmNode": LLMNode,
    "webSearchNode": WebSearchNode,
    "codeExecutorNode": CodeExecutorNode,
    "conditionNode": ConditionNode,
    "outputNode": OutputNode,
    "inputNode": OutputNode,
}


class WorkflowOrchestrator:
    def __init__(self, state_store: StateStore):
        self.state_store = state_store

    async def execute(
        self,
        execution_id: str,
        graph: GraphJSON,
        input_data: dict,
        on_node_update: Callable[[str, NodeResult], Awaitable[None]],
    ) -> dict:
        errors = dag.validate_graph(graph)
        if errors:
            raise ValueError("; ".join(errors))

        sorted_nodes = dag.topological_sort(graph)
        node_map = {node.id: node for node in graph.nodes}
        state: dict[str, Any] = {}

        input_text = input_data.get("text", "")
        for node in graph.nodes:
            node_type = node.data.get("nodeType") or node.type
            if node_type == "inputNode":
                state[node.id] = {
                    "status": "completed",
                    "output": input_text,
                    "error": None,
                    "duration_ms": 0,
                }
                await self.state_store.set_node_state(execution_id, node.id, state[node.id])

        for node_id in sorted_nodes:
            node_def = node_map.get(node_id)
            if not node_def:
                continue

            node_type = node_def.data.get("nodeType") or node_def.type

            if node_type == "inputNode":
                continue

            if dag.should_skip_node(node_id, graph, state):
                continue

            if node_type not in NODE_TYPE_MAP:
                result = NodeResult(
                    output=None,
                    status="failed",
                    error=f"Unknown node type: {node_type}",
                    duration_ms=0,
                )
                await on_node_update(node_id, result)
                return {
                    "status": "failed",
                    "error": result.error,
                    "node_logs": await self.state_store.get_all_node_states(execution_id),
                }

            if node_type == "conditionNode":
                inputs = dag.get_upstream_outputs(node_id, graph, state)
                input_value = next(iter(inputs.values()), "") if inputs else ""
                if isinstance(input_value, dict) and "value" in input_value:
                    input_value = input_value["value"]
                inputs = {"input": input_value}

            else:
                inputs = dag.get_upstream_outputs(node_id, graph, state)
                if node_type in ("llmNode", "webSearchNode", "codeExecutorNode", "outputNode"):
                    combined = list(inputs.values())
                    if len(combined) == 1:
                        inputs = {"input": combined[0]}
                    elif combined:
                        inputs = {"input": "\n".join(str(v) for v in combined)}

            node_class = NODE_TYPE_MAP[node_type]
            node_instance = node_class(node_id, node_def.data)

            start = time.time()
            result = await node_instance.execute(inputs)
            duration_ms = int((time.time() - start) * 1000)
            result.duration_ms = duration_ms

            node_state = {
                "status": result.status,
                "output": result.output,
                "error": result.error,
                "duration_ms": result.duration_ms,
            }
            state[node_id] = node_state
            await self.state_store.set_node_state(execution_id, node_id, node_state)
            await on_node_update(node_id, result)

            if result.status == "failed":
                return {
                    "status": "failed",
                    "error": result.error,
                    "node_logs": await self.state_store.get_all_node_states(execution_id),
                }

        all_states = await self.state_store.get_all_node_states(execution_id)
        final_output = None
        for node in graph.nodes:
            node_type = node.data.get("nodeType") or node.type
            if node_type == "outputNode" and node.id in all_states:
                final_output = all_states[node.id].get("output")

        return {
            "status": "completed",
            "output": final_output,
            "node_logs": all_states,
        }
