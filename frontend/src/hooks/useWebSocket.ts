import { useCallback, useEffect, useRef } from "react";
import { getWebSocketUrl } from "../api/client";
import { useExecutionStore } from "../store/executionStore";
import { useWorkflowStore } from "../store/workflowStore";

interface WebSocketMessage {
  type: string;
  node_id?: string;
  status?: string;
  output?: string;
  error?: string;
  duration_ms?: number;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;

  const { startExecution, updateNodeLog, finishExecution, failExecution } =
    useExecutionStore();
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (executionId: string) => {
      disconnect();
      retriesRef.current = 0;

      const connectWs = () => {
        const ws = new WebSocket(getWebSocketUrl(executionId));
        wsRef.current = ws;

        ws.onopen = () => {
          retriesRef.current = 0;
        };

        ws.onmessage = (event) => {
          const msg: WebSocketMessage = JSON.parse(event.data);

          switch (msg.type) {
            case "execution_started":
              startExecution(executionId);
              break;

            case "node_update":
              if (msg.node_id) {
                updateNodeLog(msg.node_id, {
                  node_id: msg.node_id,
                  status: (msg.status as "completed" | "failed") || "completed",
                  output: msg.output || "",
                  error: msg.error,
                  duration_ms: msg.duration_ms || 0,
                });
                updateNodeData(msg.node_id, {
                  status: msg.status as "running" | "completed" | "failed",
                  output: msg.output,
                  error: msg.error,
                  duration_ms: msg.duration_ms,
                });
              }
              break;

            case "execution_completed":
              finishExecution(msg.output || "");
              disconnect();
              break;

            case "execution_failed":
              failExecution(msg.error || "Execution failed");
              disconnect();
              break;
          }
        };

        ws.onerror = () => {
          if (retriesRef.current < maxRetries) {
            const delay = Math.min(1000 * 2 ** retriesRef.current, 16000);
            retriesRef.current += 1;
            setTimeout(connectWs, delay);
          } else {
            failExecution("WebSocket connection failed after retries");
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
        };
      };

      connectWs();
    },
    [
      disconnect,
      startExecution,
      updateNodeLog,
      finishExecution,
      failExecution,
      updateNodeData,
    ]
  );

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connect, disconnect };
}
