import { create } from "zustand";
import type { NodeData, Workflow, WorkflowEdge, WorkflowNode } from "../types/workflow";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  workflowName: string;
  workflowId: string | null;
  isSaving: boolean;

  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  selectNode: (nodeId: string | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowId: (id: string | null) => void;
  setIsSaving: (saving: boolean) => void;
  loadWorkflow: (workflow: Workflow) => void;
  clearCanvas: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowName: "Untitled Workflow",
  workflowId: null,
  isSaving: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set({ nodes: [...get().nodes, node] }),

  removeNode: (nodeId) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    }),

  updateNodeData: (nodeId, data) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowId: (id) => set({ workflowId: id }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  loadWorkflow: (workflow) =>
    set({
      nodes: workflow.graph_json.nodes,
      edges: workflow.graph_json.edges,
      workflowName: workflow.name,
      workflowId: workflow.id,
      selectedNodeId: null,
    }),

  clearCanvas: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      workflowId: null,
      workflowName: "Untitled Workflow",
    }),
}));
