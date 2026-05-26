import {
  Bot,
  Code,
  Flag,
  GitBranch,
  Play,
  Search,
} from "lucide-react";
import type { NodeData } from "../../types/workflow";

const NODE_TYPES: {
  type: NodeData["nodeType"];
  label: string;
  description: string;
  icon: React.ReactNode;
  defaults: Partial<NodeData>;
}[] = [
  {
    type: "inputNode",
    label: "Input",
    description: "Start of pipeline",
    icon: <Play className="w-4 h-4 text-green-600" />,
    defaults: { label: "Input", nodeType: "inputNode" },
  },
  {
    type: "llmNode",
    label: "LLM Agent",
    description: "Calls Groq LLM",
    icon: <Bot className="w-4 h-4 text-purple-600" />,
    defaults: {
      label: "LLM Agent",
      nodeType: "llmNode",
      prompt: "{{input}}",
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
    },
  },
  {
    type: "webSearchNode",
    label: "Web Search",
    description: "Tavily search",
    icon: <Search className="w-4 h-4 text-blue-600" />,
    defaults: {
      label: "Web Search",
      nodeType: "webSearchNode",
      query_template: "{{input}}",
    },
  },
  {
    type: "codeExecutorNode",
    label: "Code Executor",
    description: "Python sandbox",
    icon: <Code className="w-4 h-4 text-orange-600" />,
    defaults: {
      label: "Code Executor",
      nodeType: "codeExecutorNode",
      code: "print({{input}})",
    },
  },
  {
    type: "conditionNode",
    label: "Condition",
    description: "If/else branching",
    icon: <GitBranch className="w-4 h-4 text-amber-600" />,
    defaults: {
      label: "Condition",
      nodeType: "conditionNode",
      condition: "len(input) > 100",
      true_label: "true",
      false_label: "false",
    },
  },
  {
    type: "outputNode",
    label: "Output",
    description: "End of pipeline",
    icon: <Flag className="w-4 h-4 text-indigo-600" />,
    defaults: { label: "Output", nodeType: "outputNode" },
  },
];

export { NODE_TYPES };

export function NodePalette() {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    defaults: Partial<NodeData>
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ nodeType, defaults })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-56 border-r bg-white p-4 flex flex-col gap-2 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Nodes</h2>
      {NODE_TYPES.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(e) => onDragStart(e, item.type, item.defaults)}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {item.icon}
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
