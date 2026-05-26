import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import { useWorkflowStore } from "../../store/workflowStore";
import type { NodeData, WorkflowNode } from "../../types/workflow";
import { ConditionNode } from "../Nodes/ConditionNode";
import { InputNode } from "../Nodes/InputNode";
import { LLMNode } from "../Nodes/LLMNode";
import { OutputNode } from "../Nodes/OutputNode";
import { CodeExecutorNode, WebSearchNode } from "../Nodes/ToolNode";

const nodeTypes = {
  llmNode: LLMNode,
  webSearchNode: WebSearchNode,
  codeExecutorNode: CodeExecutorNode,
  conditionNode: ConditionNode,
  inputNode: InputNode,
  outputNode: OutputNode,
};

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    selectNode,
  } = useWorkflowStore();

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) => {
      setNodes(
        applyNodeChanges(changes, nodes as Node<NodeData>[]) as WorkflowNode[]
      );
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges) as typeof edges);
    },
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.target}-${Date.now()}`,
          },
          edges
        ) as typeof edges
      );
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw || !reactFlowWrapper.current) return;

      const { nodeType, defaults } = JSON.parse(raw);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 30,
      };

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: defaults as NodeData,
      };
      addNode(newNode);
    },
    [addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes as Node<NodeData>[]}
        edges={edges as Edge[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background gap={16} size={1} />
        <Controls position="bottom-left" />
        <MiniMap position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
