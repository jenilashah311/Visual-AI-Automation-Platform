import { useCallback } from "react";
import toast from "react-hot-toast";
import {
  createWorkflow,
  updateWorkflow,
} from "../api/client";
import { useWorkflowStore } from "../store/workflowStore";

export function useWorkflow() {
  const {
    nodes,
    edges,
    workflowName,
    workflowId,
    setIsSaving,
    setWorkflowId,
  } = useWorkflowStore();

  const saveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        graph_json: { nodes, edges },
      };

      if (workflowId) {
        await updateWorkflow(workflowId, payload);
      } else {
        const created = await createWorkflow(payload);
        setWorkflowId(created.id);
      }
      toast.success("Workflow saved");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail || "Failed to save workflow";
      toast.error(`Validation error: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, workflowName, workflowId, setIsSaving, setWorkflowId]);

  const validateForRun = useCallback((): string | null => {
    const hasInput = nodes.some((n) => n.data.nodeType === "inputNode");
    const hasOutput = nodes.some((n) => n.data.nodeType === "outputNode");
    if (!hasInput) return "Workflow must have at least one Input node";
    if (!hasOutput) return "Workflow must have at least one Output node";
    if (nodes.length === 0) return "Workflow is empty";
    return null;
  }, [nodes]);

  return { saveWorkflow, validateForRun };
}
