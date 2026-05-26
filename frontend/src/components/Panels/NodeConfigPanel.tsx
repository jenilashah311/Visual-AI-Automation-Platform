import { useWorkflowStore } from "../../store/workflowStore";
import { Input } from "../UI/Input";

export function NodeConfigPanel() {
  const { nodes, selectedNodeId, updateNodeData } = useWorkflowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="w-72 border-l bg-white p-4 text-sm text-gray-500">
        Select a node to configure
      </div>
    );
  }

  const { data } = selectedNode;
  const nodeType = data.nodeType;

  const update = (patch: Partial<typeof data>) =>
    updateNodeData(selectedNode.id, patch);

  return (
    <div className="w-72 border-l bg-white p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4">Node Configuration</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Label</label>
          <Input
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>

        {nodeType === "llmNode" && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                System prompt
              </label>
              <textarea
                value={data.system_prompt || ""}
                onChange={(e) => update({ system_prompt: e.target.value })}
                className="w-full h-20 border rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Prompt (use {"{{input}}"} as placeholder)
              </label>
              <textarea
                value={data.prompt || ""}
                onChange={(e) => update({ prompt: e.target.value })}
                className="w-full h-24 border rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Model</label>
              <select
                value={data.model || "llama-3.3-70b-versatile"}
                onChange={(e) => update({ model: e.target.value })}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="llama-3.3-70b-versatile">
                  llama-3.3-70b-versatile
                </option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (fast)</option>
                <option value="gemma2-9b-it">gemma2-9b-it</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Max tokens (100–4000)
              </label>
              <Input
                type="number"
                min={100}
                max={4000}
                value={data.max_tokens || 1000}
                onChange={(e) =>
                  update({ max_tokens: parseInt(e.target.value, 10) })
                }
              />
            </div>
          </>
        )}

        {nodeType === "webSearchNode" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Query template (use {"{{input}}"})
            </label>
            <Input
              value={data.query_template || ""}
              onChange={(e) => update({ query_template: e.target.value })}
            />
          </div>
        )}

        {nodeType === "codeExecutorNode" && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Python code (use {"{{input}}"} for upstream output)
            </label>
            <textarea
              value={data.code || ""}
              onChange={(e) => update({ code: e.target.value })}
              className="w-full h-40 border rounded-md p-2 text-sm font-mono"
            />
          </div>
        )}

        {nodeType === "conditionNode" && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Condition (Python expression, use &apos;input&apos; variable)
              </label>
              <Input
                value={data.condition || ""}
                onChange={(e) => update({ condition: e.target.value })}
                placeholder="len(input) > 100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                True branch label
              </label>
              <Input
                value={data.true_label || "true"}
                onChange={(e) => update({ true_label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                False branch label
              </label>
              <Input
                value={data.false_label || "false"}
                onChange={(e) => update({ false_label: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
