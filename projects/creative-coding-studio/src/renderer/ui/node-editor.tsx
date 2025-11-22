import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel as FlowPanel,
  useReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "./button";
import { cn } from "../utils";

const initialNodes = [
  { id: "input", type: "input", position: { x: 0, y: 80 }, data: { label: "TP Value" } },
  {
    id: "mapper",
    position: { x: 200, y: 80 },
    data: { label: "Map -> colorset.mode" },
  },
  { id: "output", type: "output", position: { x: 440, y: 80 }, data: { label: "Parameter" } },
];

const initialEdges = [
  { id: "e1-2", source: "input", target: "mapper", animated: true },
  { id: "e2-3", source: "mapper", target: "output" },
];

function NodeEditorCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rf = useReactFlow();
  const nodeTypes = useMemo(() => ({}), []);

  const fitView = () => rf.fitView({ padding: 0.1 });

  return (
    <div className="w-full h-full min-h-0">
      <ReactFlow
        className="w-full h-full"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable
        elevateEdgesOnSelect
      >
        <Background gap={16} color="#1f2937" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
        <FlowPanel position="top-right">
          <div className="flex gap-2 bg-slate-800/80 border border-slate-700 rounded px-3 py-2 shadow-lg">
            <Button size="sm" variant="secondary" onClick={fitView}>
              Fit View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }}
            >
              Reset
            </Button>
          </div>
        </FlowPanel>
      </ReactFlow>
    </div>
  );
}

export function NodeEditor({ className }: { className?: string }) {
  return (
    <div className={cn("h-full min-h-0 w-full", className)} style={{ minHeight: "100%", height: "100%" }}>
      <ReactFlowProvider>
        <div className="w-full h-full">
          <NodeEditorCanvas />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
