import type { NodeProps } from "@xyflow/react";
import { Code, Search } from "lucide-react";
import type { NodeData } from "../../types/workflow";
import { NodeShell, sourceHandle, targetHandle } from "./shared";

export function WebSearchNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <>
      {targetHandle}
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<Search className="w-4 h-4 text-blue-600" />}
        preview={nodeData.query_template?.slice(0, 60)}
      />
      {sourceHandle}
    </>
  );
}

export function CodeExecutorNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <>
      {targetHandle}
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<Code className="w-4 h-4 text-orange-600" />}
        preview={nodeData.code?.slice(0, 60) || "Python code"}
      />
      {sourceHandle}
    </>
  );
}
