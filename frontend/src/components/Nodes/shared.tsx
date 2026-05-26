import { Handle, Position } from "@xyflow/react";
import { Check, X } from "lucide-react";
import type { NodeData } from "../../types/workflow";

export function NodeShell({
  data,
  selected,
  icon,
  preview,
  children,
}: {
  data: NodeData;
  selected?: boolean;
  icon: React.ReactNode;
  preview?: string;
  children?: React.ReactNode;
}) {
  const status = data.status || "idle";
  const statusColor = {
    idle: "bg-gray-50",
    running: "bg-blue-50 animate-pulse",
    completed: "bg-green-50",
    failed: "bg-red-50",
  }[status];

  return (
    <div
      className={`rounded-xl border px-4 py-3 w-56 shadow-sm ${statusColor} ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {children}
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-medium">{data.label}</span>
        {status === "completed" && (
          <Check className="w-4 h-4 text-green-600 ml-auto" />
        )}
        {status === "failed" && <X className="w-4 h-4 text-red-600 ml-auto" />}
      </div>
      {preview && (
        <p className="text-xs text-gray-500 truncate">{preview}</p>
      )}
      {data.duration_ms !== undefined && data.duration_ms > 0 && (
        <p className="text-xs text-gray-400 mt-1">{data.duration_ms}ms</p>
      )}
    </div>
  );
}

export const targetHandle = (
  <Handle type="target" position={Position.Top} className="!bg-gray-400" />
);

export const sourceHandle = (
  <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
);
