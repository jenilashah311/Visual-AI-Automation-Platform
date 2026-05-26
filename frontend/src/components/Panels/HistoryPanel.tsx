import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { listExecutions, type Execution } from "../../api/client";
import { useExecutionStore } from "../../store/executionStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { Badge } from "../UI/Badge";

export function HistoryPanel() {
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const { resetExecution } = useExecutionStore();
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    if (!workflowId) {
      setExecutions([]);
      return;
    }
    listExecutions(workflowId)
      .then(setExecutions)
      .catch(() => setExecutions([]));
  }, [workflowId]);

  const loadExecution = (execution: Execution) => {
    resetExecution();
    Object.entries(execution.node_logs || {}).forEach(([nodeId, log]) => {
      const nodeLog = log as {
        status?: string;
        output?: unknown;
        error?: string;
        duration_ms?: number;
      };
      updateNodeData(nodeId, {
        status: nodeLog.status as "completed" | "failed" | undefined,
        output: String(nodeLog.output || ""),
        error: nodeLog.error,
        duration_ms: nodeLog.duration_ms,
      });
    });
  };

  if (!workflowId) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Save workflow to view execution history
      </div>
    );
  }

  return (
    <Tabs.Content value="history" className="p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3">Execution History</h3>
      {executions.length === 0 ? (
        <p className="text-sm text-gray-500">No executions yet</p>
      ) : (
        <div className="space-y-2">
          {executions.map((exec) => {
            const variant =
              exec.status === "completed"
                ? "success"
                : exec.status === "failed"
                  ? "error"
                  : exec.status === "running"
                    ? "running"
                    : "default";

            return (
              <button
                key={exec.id}
                onClick={() => loadExecution(exec)}
                className="w-full text-left border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={variant}>{exec.status}</Badge>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(exec.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {exec.id.slice(0, 8)}...
                </p>
              </button>
            );
          })}
        </div>
      )}
    </Tabs.Content>
  );
}
