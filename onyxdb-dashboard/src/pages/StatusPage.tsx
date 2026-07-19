import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, CircleDashed, GitCommit, GitPullRequest, Star, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const activityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      fill: true,
      label: 'Commits',
      data: [65, 85, 120, 190, 250, 310, 420],
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      tension: 0.4,
    },
    {
      fill: true,
      label: 'Pull Requests',
      data: [10, 25, 40, 65, 90, 140, 180],
      borderColor: 'rgb(14, 165, 233)',
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      tension: 0.4,
    }
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#9ca3af'
      }
    },
  },
  scales: {
    y: { grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: '#9ca3af' } },
    x: { grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: '#9ca3af' } }
  }
};

const FEATURES = [
  { title: "B+ Tree Storage Engine", status: "implemented", desc: "Core database engine operating in O(log n) time." },
  { title: "JSON over HTTP", status: "implemented", desc: "Native API allowing curl, fetch, and requests to query the DB." },
  { title: "Multi-Table Routing", status: "implemented", desc: "Dynamic payload routing to independent B+ Trees." },
  { title: "Visual Query Builder", status: "implemented", desc: "Node-based UI for constructing complex pipelines." },
  { title: "Refined Earthy Theme", status: "implemented", desc: "Dynamic light/dark modes with beautiful emerald and amber tones." },
  { title: "Scrollspy Documentation", status: "implemented", desc: "Lenis smooth scrolling with GSAP animations." },
  { title: "Background Wal (Write Ahead Log)", status: "roadmap", desc: "Durability guarantees for sudden crash recovery." },
  { title: "Vector Search (Embeddings)", status: "roadmap", desc: "HNSW graphs integrated into B+ Tree leaves for RAG." },
  { title: "Role-Based Access Control", status: "roadmap", desc: "Granular permissions per table via JWT auth." },
  { title: "Replication & Sharding", status: "roadmap", desc: "Distributed consensus (Raft) for high availability." },
  { title: "Time-Series Optimization", status: "roadmap", desc: "Columnar compression for massive event logs." },
  { title: "GraphQL Layer", status: "roadmap", desc: "Auto-generated GraphQL endpoints for nested JSON data." },
];

const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-onyx-900 pt-16 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-primary font-bold text-sm mb-6">
            <Activity className="w-4 h-4" /> Open Source Transparency
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-gray-900 dark:text-white">
            Status & <span className="text-gradient">Roadmap</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-onyx-100/70 max-w-2xl mx-auto">
            OnyxDB is proudly open-source. Track our real-time community activity, see what we've shipped, and explore what's coming next.
          </p>
        </motion.div>

        {/* Activity Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-24 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
            <GitCommit className="w-6 h-6 text-primary" /> Repository Activity
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Commits', value: '1,492', icon: GitCommit, color: 'text-primary' },
              { label: 'Pull Requests', value: '384', icon: GitPullRequest, color: 'text-secondary' },
              { label: 'Stars', value: '4.2k', icon: Star, color: 'text-yellow-500' },
              { label: 'Contributors', value: '142', icon: Users, color: 'text-green-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/50 dark:bg-onyx-800/50 p-4 rounded-xl border border-gray-200 dark:border-onyx-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-onyx-100/60 mb-2">
                  <stat.icon className={`w-4 h-4 \${stat.color}`} /> {stat.label}
                </div>
                <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="h-[400px] w-full">
            <Line data={activityData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Functionalities Grid */}
        <div>
          <h2 className="text-4xl font-display font-bold mb-12 text-center text-gray-900 dark:text-white">
            Core Functionalities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-2xl border transition-all hover:shadow-lg \${
                  feat.status === 'implemented' 
                    ? 'bg-white/80 dark:bg-onyx-800/80 border-gray-200 dark:border-onyx-700' 
                    : 'bg-gray-50/50 dark:bg-onyx-900/50 border-gray-200 border-dashed dark:border-onyx-700/50 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white pr-4">{feat.title}</h3>
                  {feat.status === 'implemented' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <CircleDashed className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-onyx-100/70 leading-relaxed">
                  {feat.desc}
                </p>
                <div className="mt-6">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full \${
                    feat.status === 'implemented' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-onyx-800 dark:text-onyx-100/50'
                  }`}>
                    {feat.status === 'implemented' ? 'Live' : 'Planned'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatusPage;
