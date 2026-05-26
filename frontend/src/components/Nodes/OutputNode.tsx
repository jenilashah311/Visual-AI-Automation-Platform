import type { NodeProps } from "@xyflow/react";
import { Flag } from "lucide-react";
import type { NodeData } from "../../types/workflow";
import { NodeShell, targetHandle } from "./shared";

export function OutputNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  return (
    <>
      {targetHandle}
      <NodeShell
        data={nodeData}
        selected={selected}
        icon={<Flag className="w-4 h-4 text-indigo-600" />}
        preview="Pipeline result"
      />
    </>
  );
}
