import { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import type { Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Start Query' }, type: 'input' },
];
const initialEdges = [] as Edge[];

export default function VisualQueryBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [queryResult, setQueryResult] = useState<any>(null);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addSelectNode = () => {
    setNodes((nds) => [
      ...nds,
      { id: Date.now().toString(), position: { x: Math.random() * 250, y: Math.random() * 250 }, data: { label: 'Select Data' } }
    ]);
  };

  const addFilterNode = () => {
    setNodes((nds) => [
      ...nds,
      { id: Date.now().toString(), position: { x: Math.random() * 250, y: Math.random() * 250 }, data: { label: 'Filter (WHERE)' } }
    ]);
  };

  const executePipeline = async () => {
    // In a real application, we would traverse the nodes and edges to build the AST.
    // For this prototype, we'll send a basic select query if a "Select Data" node exists.
    const hasSelect = nodes.some(n => n.data.label === 'Select Data');
    if (!hasSelect) {
      setQueryResult({ error: "Pipeline must contain a 'Select Data' node." });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "select", table: "users" })
      });
      const data = await response.json();
      setQueryResult(data);
    } catch (e) {
      setQueryResult({ error: "Failed to execute visual query." });
    }
  };

  return (
    <div className="w-full h-[600px] border border-onyx-700 rounded-lg overflow-hidden flex flex-col bg-onyx-900">
      <div className="p-4 bg-onyx-800 border-b border-onyx-700 flex gap-4">
        <button onClick={addSelectNode} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
          + Add Select Node
        </button>
        <button onClick={addFilterNode} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500">
          + Add Filter Node
        </button>
        <div className="flex-1"></div>
        <button onClick={executePipeline} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-bold">
          ▶ Execute Pipeline
        </button>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
        <div className="w-80 bg-onyx-950 p-4 border-l border-onyx-700 overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-4">Pipeline Results</h3>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {queryResult ? JSON.stringify(queryResult, null, 2) : "Ready to execute..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
