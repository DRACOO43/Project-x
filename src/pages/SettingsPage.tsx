import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Database,
  ShieldCheck,
  Server,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import api from '../services/api.ts';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await api.get('/health');
      setHealthData(res.data);
    } catch (e) {
      // Ignore
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings & Platform Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inspect database connections, adjust theme preferences, and audit system status.
        </p>
      </div>

      {/* Theme Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
          Display Theme & Appearance
        </h2>
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Dark Mode Theme
            </span>
            <span className="text-[11px] text-slate-400">
              Toggle between high-contrast dark palette and standard light SaaS theme.
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      {/* Database & MERN Architecture Diagnostic Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            Database & Backend Health Endpoint
          </h2>
          <button
            onClick={fetchHealth}
            disabled={loadingHealth}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            title="Refresh Diagnostic"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {healthData ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Database Engine Mode</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {healthData.database?.mode || 'Active'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Backend API Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {healthData.status?.toUpperCase() || 'HEALTHY'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1">
              <div>
                <strong>Application:</strong> {healthData.app} (v{healthData.version})
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>Configured URI:</strong> {healthData.database?.uri}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Loading diagnostic telemetry...</p>
        )}
      </div>

      {/* Security Architecture Guidelines */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Security Architecture & RBAC Policy
        </h2>
        <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
          <li>
            <strong>Password Hashing:</strong> Passwords hashed with bcryptjs (salt factor 10). Plaintext passwords are never logged or stored.
          </li>
          <li>
            <strong>JWT Tokens:</strong> Authenticated sessions utilize signed JSON Web Tokens with 7-day expiration.
          </li>
          <li>
            <strong>Role Enforcement:</strong> Project management and user role modifications require strict backend authorization middleware verification.
          </li>
          <li>
            <strong>CSV Sanitization:</strong> All exported spreadsheets strip and escape arithmetic characters to eliminate spreadsheet formula injection vulnerabilities.
          </li>
        </ul>
      </div>
    </div>
  );
};
