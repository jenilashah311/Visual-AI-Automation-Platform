import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Play, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { createExecution } from "../../api/client";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useWorkflow } from "../../hooks/useWorkflow";
import { useExecutionStore } from "../../store/executionStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { Button } from "../UI/Button";
import { Input } from "../UI/Input";

interface CanvasToolbarProps {
  onOpenTemplates: () => void;
}

export function CanvasToolbar({ onOpenTemplates }: CanvasToolbarProps) {
  const {
    workflowName,
    setWorkflowName,
    workflowId,
    isSaving,
    clearCanvas,
    setWorkflowId,
  } = useWorkflowStore();
  const { isRunning, resetExecution } = useExecutionStore();
  const { saveWorkflow, validateForRun } = useWorkflow();
  const { connect } = useWebSocket();

  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleRun = async () => {
    const error = validateForRun();
    if (error) {
      setValidationError(error);
      toast.error(`Validation error: ${error}`);
      return;
    }
    setValidationError(null);

    if (!workflowId) {
      toast.error("Please save the workflow before running");
      return;
    }

    setIsStarting(true);
    resetExecution();
    try {
      const execution = await createExecution(workflowId, { text: inputText });
      setRunDialogOpen(false);
      connect(execution.id);
      toast.success("Execution started");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start execution";
      toast.error(`Execution failed: ${message}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b bg-white">
      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        className="max-w-xs font-medium"
        placeholder="Workflow name"
      />

      <Button onClick={saveWorkflow} disabled={isSaving} size="sm">
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <Save className="w-4 h-4 mr-1" />
        )}
        {isSaving ? "Saving..." : "Save"}
      </Button>

      <Dialog.Root open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <Dialog.Trigger asChild>
          <Button disabled={isRunning} size="sm">
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[480px] shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Run Workflow
            </Dialog.Title>
            <label className="text-sm text-gray-600 mb-1 block">
              Input text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 border rounded-md p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to feed the Input node..."
            />
            {validationError && (
              <p className="text-sm text-red-600 mb-3">{validationError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRunDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRun} disabled={isStarting}>
                {isStarting && (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                )}
                Run
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Button variant="outline" size="sm" onClick={onOpenTemplates}>
        Templates
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          clearCanvas();
          setWorkflowId(null);
          resetExecution();
        }}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Clear
      </Button>
    </div>
  );
}
