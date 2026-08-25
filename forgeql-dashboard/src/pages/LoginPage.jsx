import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import { Lock, User, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { ok, data } = await login(username, password);
      if (ok && data.status === 'success') {
        sessionStorage.setItem('forge_jwt_token', data.token);
        sessionStorage.setItem('forge_user_role', data.role);
        sessionStorage.setItem('forge_username', data.username);
        navigate('/studio');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('forge_jwt_token', 'demo-admin-jwt-token');
        sessionStorage.setItem('forge_user_role', 'ADMIN');
        sessionStorage.setItem('forge_username', 'admin');
        navigate('/studio');
      } else if (username === 'readonly' && password === 'read123') {
        sessionStorage.setItem('forge_jwt_token', 'demo-readonly-jwt-token');
        sessionStorage.setItem('forge_user_role', 'READ_ONLY');
        sessionStorage.setItem('forge_username', 'readonly');
        navigate('/studio');
      } else {
        setError('Cannot connect to ForgeQL server. Ensure server is running on port 8080.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[#121214] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle glow accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4 p-2">
              <img src="/assets/logo.webp" alt="ForgeQL" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Forge Studio Login</h2>
            <p className="text-xs text-white/50 mt-1">Sign in to access your local ForgeQL instance</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono uppercase text-white/40 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or readonly"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-white/40 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-white/10">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-3 text-center">
              Quick Fill Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 flex items-center justify-center transition-colors"
              >
                <Key className="w-3 h-3 mr-1.5 text-orange-400" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('readonly', 'read123')}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 flex items-center justify-center transition-colors"
              >
                <Key className="w-3 h-3 mr-1.5 text-orange-400" />
                Read-Only
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
