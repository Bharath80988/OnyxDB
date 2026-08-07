import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, Key } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        sessionStorage.setItem('onyx_jwt_token', data.token);
        sessionStorage.setItem('onyx_user_role', data.role);
        sessionStorage.setItem('onyx_username', data.username);
        navigate('/app');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      // Fallback for development if API is offline
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('onyx_jwt_token', 'demo-admin-jwt-token');
        sessionStorage.setItem('onyx_user_role', 'ADMIN');
        sessionStorage.setItem('onyx_username', 'admin');
        navigate('/app');
      } else if (username === 'readonly' && password === 'read123') {
        sessionStorage.setItem('onyx_jwt_token', 'demo-readonly-jwt-token');
        sessionStorage.setItem('onyx_user_role', 'READ_ONLY');
        sessionStorage.setItem('onyx_username', 'readonly');
        navigate('/app');
      } else {
        setError('Cannot connect to OnyxDB server. Ensure server is running on port 8080.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-onyx-800/80 backdrop-blur-xl border border-gray-200 dark:border-onyx-700/60 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow accent decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white mb-4 shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Onyx Studio Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access your local OnyxDB instance
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or readonly"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-onyx-900/90 border border-gray-300 dark:border-onyx-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-onyx-900/90 border border-gray-300 dark:border-onyx-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Studio'}
            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
          </button>
        </form>

        {/* Quick Fill Preset Accounts */}
        <div className="pt-4 border-t border-gray-200 dark:border-onyx-700/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 text-center">
            Quick Fill Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition"
            >
              <Key className="w-3.5 h-3.5 mr-1.5" />
              Admin User
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('readonly', 'read123')}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center transition"
            >
              <Key className="w-3.5 h-3.5 mr-1.5" />
              Read-Only User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
