import type { NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";
import type { NodeData } from "../../types/workflow";
import { NodeShell, sourceHandle, targetHandle } from "./shared";

export function LLMNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <>
      {targetHandle}
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<Bot className="w-4 h-4 text-purple-600" />}
        preview={nodeData.prompt?.slice(0, 60)}
      />
      {sourceHandle}
    </>
  );
}
