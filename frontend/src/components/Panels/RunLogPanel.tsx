import { useEffect, useRef } from "react";
import { useExecutionStore } from "../../store/executionStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { Badge } from "../UI/Badge";

export function RunLogPanel() {
  const { nodeLogs, finalOutput, error, isRunning } = useExecutionStore();
  const nodes = useWorkflowStore((s) => s.nodes);
  const scrollRef = useRef<HTMLDivElement>(null);

  const logs = Object.entries(nodeLogs);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  if (!isRunning && logs.length === 0 && !finalOutput && !error) {
    return null;
  }

  return (
    <div className="h-48 border-t bg-white flex flex-col">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold">Execution Log</h3>
        {isRunning && <Badge variant="running">Running</Badge>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {logs.map(([nodeId, log]) => {
          const node = nodes.find((n) => n.id === nodeId);
          const statusVariant =
            log.status === "completed"
              ? "success"
              : log.status === "failed"
                ? "error"
                : "running";

          return (
            <div
              key={nodeId}
              className="border rounded-lg p-3 text-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {node?.data.label || nodeId}
                </span>
                <span className="text-xs text-gray-400">
                  {node?.data.nodeType}
                </span>
                <Badge variant={statusVariant}>{log.status}</Badge>
                {log.duration_ms > 0 && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {log.duration_ms}ms
                  </span>
                )}
              </div>
              {log.output && (
                <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                  {log.output.slice(0, 300)}
                  {log.output.length > 300 && "..."}
                </p>
              )}
              {log.error && (
                <p className="text-xs text-red-600 mt-1">{log.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {(finalOutput || error) && (
        <div className="px-4 py-3 border-t">
          {error ? (
            <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          ) : (
            <div className="bg-green-50 text-green-800 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
              <p className="text-xs font-semibold mb-1">Final Output</p>
              {finalOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
