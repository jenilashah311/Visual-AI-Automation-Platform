import type { NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import type { NodeData } from "../../types/workflow";
import { NodeShell, sourceHandle } from "./shared";

export function InputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <>
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<Play className="w-4 h-4 text-green-600" />}
        preview="Workflow entry point"
      />
      {sourceHandle}
    </>
  );
}
