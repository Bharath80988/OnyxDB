import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import type { Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Database, Filter } from 'lucide-react';

// --- Custom Nodes for Futuristic Look ---
const nodeStyle = "glass-card p-4 min-w-[200px] border-primary/50 shadow-glow-primary";
const headerStyle = "flex items-center gap-2 mb-2 pb-2 border-b border-onyx-600/50";

const SelectNode = () => (
  <div className={nodeStyle}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-secondary" />
    <div className={headerStyle}>
      <Database className="w-4 h-4 text-primary" />
      <span className="font-bold text-sm text-white">Table Select</span>
    </div>
    <div className="text-xs text-onyx-100/70">
      <label className="block mb-1">Table Name:</label>
      <input type="text" defaultValue="users" className="w-full bg-onyx-900/50 border border-onyx-600 rounded p-1 text-primary focus:outline-none focus:border-primary" />
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
  </div>
);

const FilterNode = () => (
  <div className={nodeStyle}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-secondary" />
    <div className={headerStyle}>
      <Filter className="w-4 h-4 text-secondary" />
      <span className="font-bold text-sm text-white">Filter</span>
    </div>
    <div className="text-xs text-onyx-100/70 space-y-2">
      <div>
        <label className="block mb-1">Field:</label>
        <input type="text" defaultValue="role" className="w-full bg-onyx-900/50 border border-onyx-600 rounded p-1 text-secondary focus:outline-none focus:border-secondary" />
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
  </div>
);

const nodeTypes = {
  selectNode: SelectNode,
  filterNode: FilterNode,
};

const initialNodes = [
  { id: '1', type: 'selectNode', position: { x: 250, y: 150 }, data: { label: 'Select' } },
];

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-onyx-800/80 backdrop-blur-xl border-l border-onyx-600/50 p-4 flex flex-col gap-4 z-10">
      <h3 className="font-display font-bold text-lg mb-2">Node Library</h3>
      <div className="text-xs text-onyx-100/50 mb-4">Drag nodes to the canvas to build your pipeline.</div>
      
      <div 
        className="glass-card p-3 flex items-center gap-3 cursor-grab hover:border-primary/50 transition-colors" 
        onDragStart={(event) => onDragStart(event, 'selectNode')} 
        draggable
      >
        <Database className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm">Table Select</span>
      </div>
      
      <div 
        className="glass-card p-3 flex items-center gap-3 cursor-grab hover:border-secondary/50 transition-colors" 
        onDragStart={(event) => onDragStart(event, 'filterNode')} 
        draggable
      >
        <Filter className="w-5 h-5 text-secondary" />
        <span className="font-bold text-sm">Filter</span>
      </div>
    </aside>
  );
};

interface VisualQueryBuilderProps {
  onRun?: (query: string) => void;
}

const Flow = ({ onRun }: VisualQueryBuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback((params: Edge | Connection) => {
    // Add glowing animated effect to edges
    const animatedEdge = { ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.8))' } };
    setEdges((eds) => addEdge(animatedEdge, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: Date.now().toString(),
        type,
        position,
        data: { label: `${type} node` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const executePipeline = () => {
    if (onRun) {
      // Basic AST translation: just check for a select node for demo purposes
      const hasSelect = nodes.some(n => n.type === 'selectNode');
      if (!hasSelect) {
        onRun(JSON.stringify({ error: "Pipeline needs a Select Node" }));
        return;
      }
      onRun(JSON.stringify({ action: "select", table: "users" }, null, 2));
    }
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 z-10">
         <button 
          onClick={executePipeline}
          className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-glow-primary flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Execute Pipeline
        </button>
      </div>

      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-onyx-900"
        >
          <Background color="#37333d" gap={16} size={1} />
          <Controls className="bg-onyx-800 border-onyx-600 fill-primary" />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default function VisualQueryBuilder(props: VisualQueryBuilderProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
