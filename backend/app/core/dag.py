from typing import Any

from app.schemas.workflow import GraphJSON


def build_adjacency(graph: GraphJSON) -> dict[str, list[str]]:
    """Returns a dict mapping each node_id to a list of its downstream node_ids."""
    adjacency: dict[str, list[str]] = {node.id: [] for node in graph.nodes}
    for edge in graph.edges:
        if edge.source in adjacency:
            adjacency[edge.source].append(edge.target)
    return adjacency


def topological_sort(graph: GraphJSON) -> list[str]:
    """Kahn's algorithm for topological sort."""
    node_ids = [node.id for node in graph.nodes]
    in_degree: dict[str, int] = {node_id: 0 for node_id in node_ids}

    for edge in graph.edges:
        if edge.target in in_degree:
            in_degree[edge.target] += 1

    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    result: list[str] = []

    adjacency = build_adjacency(graph)

    while queue:
        current = queue.pop(0)
        result.append(current)
        for downstream in adjacency.get(current, []):
            in_degree[downstream] -= 1
            if in_degree[downstream] == 0:
                queue.append(downstream)

    if len(result) != len(node_ids):
        raise ValueError("Workflow contains a cycle")

    return result


def get_upstream_outputs(
    node_id: str,
    graph: GraphJSON,
    state: dict[str, Any],
) -> dict[str, Any]:
    """Get outputs from all upstream nodes connected to this node."""
    inputs: dict[str, Any] = {}
    for edge in graph.edges:
        if edge.target != node_id:
            continue
        source_state = state.get(edge.source, {})
        output = source_state.get("output")
        if output is None:
            continue

        if edge.sourceHandle:
            if isinstance(output, dict) and "branch" in output:
                if output["branch"] != edge.sourceHandle:
                    continue
                output = output.get("value", output)

        inputs[edge.source] = output
    return inputs


def should_skip_node(node_id: str, graph: GraphJSON, state: dict[str, Any]) -> bool:
    """Skip nodes on inactive condition branches."""
    incoming = [e for e in graph.edges if e.target == node_id]
    if not incoming:
        return False

    has_active_input = False
    for edge in incoming:
        source_state = state.get(edge.source, {})
        output = source_state.get("output")
        if output is None:
            continue
        if edge.sourceHandle and isinstance(output, dict) and "branch" in output:
            if output["branch"] == edge.sourceHandle:
                has_active_input = True
        else:
            has_active_input = True

    return not has_active_input


def validate_graph(graph: GraphJSON) -> list[str]:
    """Returns list of validation error strings (empty = valid)."""
    errors: list[str] = []

    if not graph.nodes:
        errors.append("Workflow must have at least one node")
        return errors

    node_ids = {node.id for node in graph.nodes}

    for edge in graph.edges:
        if edge.source not in node_ids:
            errors.append(f"Edge references unknown source node: {edge.source}")
        if edge.target not in node_ids:
            errors.append(f"Edge references unknown target node: {edge.target}")

    for node in graph.nodes:
        node_type = node.data.get("nodeType") or node.type
        if node_type == "llmNode":
            prompt = node.data.get("prompt", "")
            if not prompt or not str(prompt).strip():
                errors.append(f"LLM node '{node.id}' requires a non-empty prompt")
        if node_type == "conditionNode":
            condition = node.data.get("condition", "")
            if not condition or not str(condition).strip():
                errors.append(f"Condition node '{node.id}' requires a non-empty condition")

    try:
        topological_sort(graph)
    except ValueError as e:
        errors.append(str(e))

    return errors
