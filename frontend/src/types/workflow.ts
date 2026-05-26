export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType:
    | "llmNode"
    | "webSearchNode"
    | "codeExecutorNode"
    | "conditionNode"
    | "inputNode"
    | "outputNode";
  prompt?: string;
  model?: string;
  max_tokens?: number;
  system_prompt?: string;
  query_template?: string;
  code?: string;
  condition?: string;
  true_label?: string;
  false_label?: string;
  status?: "idle" | "running" | "completed" | "failed";
  output?: string;
  error?: string;
  duration_ms?: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  graph_json: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
  created_at: string;
}

export interface ExecutionLog {
  node_id: string;
  status: "completed" | "failed" | "running";
  output: string;
  error?: string;
  duration_ms: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  graph_json: { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
}
