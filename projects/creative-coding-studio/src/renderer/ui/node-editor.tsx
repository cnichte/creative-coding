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

type DropHandler = (item: { id: string; name: string }) => void;

function NodeEditorCanvas({ onDropComponent }: { onDropComponent?: DropHandler }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rf = useReactFlow();
  const nodeTypes = useMemo(() => ({}), []);

  const fitView = () => rf.fitView({ padding: 0.1 });
  const zoomIn = () => rf.zoomIn({ duration: 200 });
  const zoomOut = () => rf.zoomOut({ duration: 200 });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data?.id && data?.name) {
        const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const newNode = {
          id: `node-${Date.now()}`,
          position: pos,
          data: { label: data.name },
        };
        setNodes((nds) => nds.concat(newNode));
        if (onDropComponent) {
          onDropComponent({ id: data.id, name: data.name });
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="w-full h-full min-h-0 flex-1 reactflow-wrapper relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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
        panOnDrag
        selectionOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#1f2937" />
        <Controls showInteractive style={{ left: 8, bottom: 8 }} />
        <MiniMap pannable zoomable position="top-left" style={{ left: 8, top: 8 }} />
        <FlowPanel position="top-right">
          <div className="flex flex-col gap-2 bg-slate-800/80 border border-slate-700 rounded px-2 py-2 shadow-lg">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={fitView} aria-label="Fit View">
              F
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={zoomIn} aria-label="Zoom In">
              +
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={zoomOut} aria-label="Zoom Out">
              -
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }}
              aria-label="Reset Graph"
            >
              Reset
            </Button>
          </div>
        </FlowPanel>
      </ReactFlow>
    </div>
  );
}

export function NodeEditor({
  className,
  onDropComponent,
}: {
  className?: string;
  onDropComponent?: (item: { id: string; name: string }) => void;
}) {
  return (
    <div className={cn("h-full min-h-0 w-full", className)} style={{ minHeight: "100%", height: "100%" }}>
      <ReactFlowProvider>
        <div className="w-full h-full">
          <NodeEditorCanvas onDropComponent={onDropComponent} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
