import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import type { NodeData } from "../../types/workflow";
import { NodeShell, targetHandle } from "./shared";

export function ConditionNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const trueLabel = nodeData.true_label || "true";
  const falseLabel = nodeData.false_label || "false";

  return (
    <>
      {targetHandle}
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<GitBranch className="w-4 h-4 text-amber-600" />}
        preview={nodeData.condition?.slice(0, 60)}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={trueLabel}
        style={{ left: "30%" }}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={falseLabel}
        style={{ left: "70%" }}
        className="!bg-red-500"
      />
    </>
  );
}
