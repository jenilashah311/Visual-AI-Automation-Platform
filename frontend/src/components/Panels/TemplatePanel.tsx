import * as Dialog from "@radix-ui/react-dialog";
import { TEMPLATES } from "../../data/templates";
import { useWorkflowStore } from "../../store/workflowStore";
import { Button } from "../UI/Button";

interface TemplatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePanel({ open, onOpenChange }: TemplatePanelProps) {
  const { setNodes, setEdges, setWorkflowName, setWorkflowId } =
    useWorkflowStore();

  const loadTemplate = (template: (typeof TEMPLATES)[0]) => {
    setNodes(template.graph_json.nodes);
    setEdges(template.graph_json.edges);
    setWorkflowName(template.name);
    setWorkflowId(null);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[600px] shadow-xl max-h-[80vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Workflow Templates
          </Dialog.Title>
          <div className="grid gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.description}
                  </p>
                </div>
                <Button size="sm" onClick={() => loadTemplate(template)}>
                  Load template
                </Button>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
