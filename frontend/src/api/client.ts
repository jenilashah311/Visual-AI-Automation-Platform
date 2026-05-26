import axios from "axios";
import type { ExecutionLog, Workflow, WorkflowTemplate } from "../types/workflow";

const API_BASE = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export interface WorkflowListItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Execution {
  id: string;
  workflow_id: string;
  status: string;
  input_data: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  node_logs: Record<string, ExecutionLog>;
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export async function listWorkflows(): Promise<WorkflowListItem[]> {
  const { data } = await api.get("/api/workflows");
  return data;
}

export async function getWorkflow(id: string): Promise<Workflow> {
  const { data } = await api.get(`/api/workflows/${id}`);
  return data;
}

export async function createWorkflow(payload: {
  name: string;
  description?: string;
  graph_json: { nodes: unknown[]; edges: unknown[] };
}): Promise<Workflow> {
  const { data } = await api.post("/api/workflows", payload);
  return data;
}

export async function updateWorkflow(
  id: string,
  payload: {
    name?: string;
    description?: string;
    graph_json?: { nodes: unknown[]; edges: unknown[] };
  }
): Promise<Workflow> {
  const { data } = await api.put(`/api/workflows/${id}`, payload);
  return data;
}

export async function deleteWorkflow(id: string): Promise<void> {
  await api.delete(`/api/workflows/${id}`);
}

export async function getTemplates(): Promise<WorkflowTemplate[]> {
  const { data } = await api.get("/api/workflows/templates");
  return data;
}

export async function createExecution(
  workflowId: string,
  inputData: { text: string }
): Promise<Execution> {
  const { data } = await api.post("/api/executions", {
    workflow_id: workflowId,
    input_data: inputData,
  });
  return data;
}

export async function getExecution(id: string): Promise<Execution> {
  const { data } = await api.get(`/api/executions/${id}`);
  return data;
}

export async function listExecutions(workflowId: string): Promise<Execution[]> {
  const { data } = await api.get("/api/executions", {
    params: { workflow_id: workflowId },
  });
  return data;
}

export function getWebSocketUrl(executionId: string): string {
  return `ws://localhost:8000/ws/executions/${executionId}`;
}
