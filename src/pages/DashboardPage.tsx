import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { stats, overdueTasks, upcomingDeadlines, ruleBasedRecommendations, charts } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Executive Workspace
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            You are operating with <span className="font-bold underline uppercase">{user?.role?.replace('_', ' ')}</span> permissions. All statistics are calculated from real backend models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          <Link
            to="/projects"
            className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-md transition-all flex items-center gap-1"
          >
            View Projects
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Projects</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalProjects}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {stats.activeProjects} Active
            </span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalTasks}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {stats.completedTasks} Done
            </span>
          </div>
        </div>

        {/* Overdue Milestones */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {stats.overdueTasksCount}
            </span>
            <span className="text-[11px] font-medium text-rose-500">
              Requires Attention
            </span>
          </div>
        </div>

        {/* Overall Completion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Progress</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.overallCompletionPercentage}%
            </span>
            <span className="text-xs font-medium text-slate-500">Dynamic Task Ratio</span>
          </div>
        </div>
      </div>

      {/* Deadline Alerts & Smart Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deadline Alerts Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming & Overdue Deadlines
              </h2>
            </div>
            <Link to="/calendar" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Calendar View
            </Link>
          </div>

          <div className="space-y-2.5">
            {overdueTasks.length === 0 && upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All deadlines are in good standing! No overdue tasks detected.
              </p>
            ) : (
              <>
                {overdueTasks.slice(0, 3).map((t: any) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-rose-800 dark:text-rose-300">
                          {t.title}
                        </span>
                        <StatusBadge type="priority" value={t.priority} />
                      </div>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400">
                        Overdue: Due {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/tasks`}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700"
                    >
                      Resolve
                    </Link>
                  </div>
                ))}

                {upcomingDeadlines.slice(0, 3).map((t: any) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-amber-800 dark:text-amber-300">
                          {t.title}
                        </span>
                        <StatusBadge type="priority" value={t.priority} />
                      </div>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                        Due in next 3 days: {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/tasks`}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold text-[11px] hover:bg-amber-700"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Rule-Based Recommendations Panel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Priority-Based Recommendations
                </h2>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Rule-based heuristic prioritization engine
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Deterministic Logic
            </span>
          </div>

          <div className="space-y-2.5">
            {ruleBasedRecommendations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No backlog recommendations currently needed.
              </p>
            ) : (
              ruleBasedRecommendations.slice(0, 4).map((rec: any, idx: number) => (
                <div
                  key={rec.task._id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {idx + 1}. {rec.task.title}
                      </span>
                      <StatusBadge type="priority" value={rec.task.priority} />
                    </div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      💡 {rec.reason}
                    </span>
                  </div>
                  <Link
                    to="/tasks"
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 flex-shrink-0"
                  >
                    Action
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Donut Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Project Status Breakdown
          </h2>
          <div className="h-64 flex items-center justify-center">
            {charts.projectStatusDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No project status data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.projectStatusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {charts.projectStatusDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task Status Distribution Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Task Execution Statuses
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.taskStatusDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Projects Progress & Health Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Monitored Projects Health & Completion
          </h2>
          <Link to="/projects" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            All Projects →
          </Link>
        </div>

        <div className="space-y-3">
          {charts.projectProgressList.map((item: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="w-48">
                <span className="font-semibold text-slate-900 dark:text-white block truncate">
                  {item.name}
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                  {item.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex-1 max-w-md w-full">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-blue-600">{item.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="w-28 text-right">
                <StatusBadge type="health" value={item.health} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
