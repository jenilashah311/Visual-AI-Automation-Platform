import * as Tabs from "@radix-ui/react-tabs";
import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { CanvasToolbar } from "./components/Canvas/CanvasToolbar";
import { NodePalette } from "./components/Canvas/NodePalette";
import { WorkflowCanvas } from "./components/Canvas/WorkflowCanvas";
import { HistoryPanel } from "./components/Panels/HistoryPanel";
import { NodeConfigPanel } from "./components/Panels/NodeConfigPanel";
import { RunLogPanel } from "./components/Panels/RunLogPanel";
import { TemplatePanel } from "./components/Panels/TemplatePanel";
import { useWorkflow } from "./hooks/useWorkflow";
import { useWorkflowStore } from "./store/workflowStore";

function App() {
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { saveWorkflow } = useWorkflow();
  const { selectedNodeId, selectNode, removeNode } = useWorkflowStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveWorkflow();
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedNodeId &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        removeNode(selectedNodeId);
      }
      if (e.key === "Escape") {
        selectNode(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveWorkflow, selectedNodeId, selectNode, removeNode]);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gray-100">
        <Toaster position="top-right" />
        <CanvasToolbar onOpenTemplates={() => setTemplatesOpen(true)} />
        <TemplatePanel open={templatesOpen} onOpenChange={setTemplatesOpen} />

        <div className="flex flex-1 min-h-0">
          <Tabs.Root defaultValue="nodes" className="flex">
            <div className="flex flex-col border-r bg-white">
              <Tabs.List className="flex border-b">
                <Tabs.Trigger
                  value="nodes"
                  className="px-4 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  Nodes
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="history"
                  className="px-4 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  History
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="nodes">
                <NodePalette />
              </Tabs.Content>
              <HistoryPanel />
            </div>
          </Tabs.Root>

          <div className="flex-1 flex flex-col min-w-0">
            <WorkflowCanvas />
            <RunLogPanel />
          </div>

          <NodeConfigPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
