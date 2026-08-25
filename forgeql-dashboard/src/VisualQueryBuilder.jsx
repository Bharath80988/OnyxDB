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
import 'reactflow/dist/style.css';
import { Play, Database, Filter } from 'lucide-react';

/* ─── Custom Node Styles (dark theme) ─── */
const nodeStyle = "bg-[#141416]/90 backdrop-blur-md p-4 min-w-[200px] border border-white/10 rounded-2xl shadow-xl";
const headerStyle = "flex items-center gap-2 mb-2 pb-2 border-b border-white/10";

const SelectNode = () => (
  <div className={nodeStyle}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-orange-500" />
    <div className={headerStyle}>
      <Database className="w-4 h-4 text-orange-400" />
      <span className="font-semibold text-sm text-white">Table Select</span>
    </div>
    <div className="text-xs text-white/50">
      <label className="block mb-1">Table Name:</label>
      <input
        type="text"
        defaultValue="users"
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-orange-400 focus:outline-none focus:border-white/30"
      />
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-orange-500" />
  </div>
);

const FilterNode = () => (
  <div className={nodeStyle}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-amber-500" />
    <div className={headerStyle}>
      <Filter className="w-4 h-4 text-amber-400" />
      <span className="font-semibold text-sm text-white">Filter</span>
    </div>
    <div className="text-xs text-white/50 space-y-2">
      <div>
        <label className="block mb-1">Field:</label>
        <input
          type="text"
          defaultValue="role"
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-amber-400 focus:outline-none focus:border-white/30"
        />
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-orange-500" />
  </div>
);

const OqsNode = () => (
  <div className={nodeStyle}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-cyan-400" />
    <div className={headerStyle}>
      <Database className="w-4 h-4 text-cyan-400" />
      <span className="font-semibold text-sm text-white">FQL Query</span>
    </div>
    <div className="text-xs text-white/50 space-y-2">
      <div>
        <label className="block mb-1">Query String:</label>
        <input
          type="text"
          defaultValue="GET users 101"
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-cyan-400 focus:outline-none focus:border-white/30"
        />
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-cyan-400" />
  </div>
);

const nodeTypes = {
  selectNode: SelectNode,
  filterNode: FilterNode,
  fqlNode: OqsNode,
};

const initialNodes = [
  { id: '1', type: 'selectNode', position: { x: 250, y: 150 }, data: { label: 'Select' } },
];

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-56 bg-black/80 backdrop-blur-xl border-l border-white/10 p-4 flex flex-col gap-4 z-10">
      <h3 className="font-semibold text-sm mb-1">Node Library</h3>
      <div className="text-[10px] text-white/40 mb-2">Drag nodes to the canvas to build your pipeline.</div>

      <div
        className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3 cursor-grab hover:border-orange-500/30 transition-colors"
        onDragStart={(event) => onDragStart(event, 'selectNode')}
        draggable
      >
        <Database className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-medium">Table Select</span>
      </div>

      <div
        className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3 cursor-grab hover:border-amber-500/30 transition-colors"
        onDragStart={(event) => onDragStart(event, 'filterNode')}
        draggable
      >
        <Filter className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium">Filter</span>
      </div>

      <div
        className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-3 cursor-grab hover:border-cyan-400/30 transition-colors"
        onDragStart={(event) => onDragStart(event, 'fqlNode')}
        draggable
      >
        <Database className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium">FQL Query</span>
      </div>
    </aside>
  );
};

const Flow = ({ onRun }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      const animatedEdge = {
        ...params,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))' },
      };
      setEdges((eds) => addEdge(animatedEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
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
      const hasOqs = nodes.some((n) => n.type === 'fqlNode');
      if (hasOqs) {
        onRun(JSON.stringify({ fql: 'GET users 101' }, null, 2));
        return;
      }
      const hasSelect = nodes.some((n) => n.type === 'selectNode');
      if (!hasSelect) {
        onRun(JSON.stringify({ error: 'Pipeline needs a Select Node or FQL Node' }));
        return;
      }
      onRun(JSON.stringify({ action: 'select', table: 'users' }, null, 2));
    }
  };

  return (
    <div className="flex h-full w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={executePipeline}
          className="bg-white text-black px-4 py-2 rounded-full text-xs font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          Execute Pipeline
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
          className="bg-[#050505]"
        >
          <Background color="#1a1a1a" gap={16} size={1} />
          <Controls className="!bg-white/5 !border-white/10 [&_button]:!bg-white/10 [&_button]:!border-white/10 [&_button]:!text-white [&_button:hover]:!bg-white/20" />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default function VisualQueryBuilder(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
