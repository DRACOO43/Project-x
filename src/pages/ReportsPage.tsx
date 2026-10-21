import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();

  const [projectReports, setProjectReports] = useState<any>(null);
  const [taskReports, setTaskReports] = useState<any>(null);
  const [teamReports, setTeamReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, teamRes] = await Promise.all([
        api.get('/reports/projects'),
        api.get('/reports/tasks'),
        api.get('/reports/team'),
      ]);
      if (projRes.data.success) setProjectReports(projRes.data);
      if (taskRes.data.success) setTaskReports(taskRes.data);
      if (teamRes.data.success) setTeamReports(teamRes.data);
    } catch (e) {
      showToast('Failed to generate analytics report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadCSV = async (type: 'projects' | 'tasks') => {
    try {
      showToast(`Generating ${type} CSV export...`, 'info');
      const res = await api.get('/reports/export/csv', {
        params: { type },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart-pm-${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV downloaded successfully', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  if (loading || !projectReports || !taskReports) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { statusCounts: pStatus, healthCounts } = projectReports;
  const { statusCounts: tStatus, totalTasks, completedTasks, pendingTasks, overdueTasks } = taskReports;

  const projectStatusData = [
    { name: 'Planning', count: pStatus.planning || 0, fill: '#3b82f6' },
    { name: 'In Progress', count: pStatus.in_progress || 0, fill: '#0ea5e9' },
    { name: 'On Hold', count: pStatus.on_hold || 0, fill: '#f59e0b' },
    { name: 'Completed', count: pStatus.completed || 0, fill: '#10b981' },
    { name: 'Cancelled', count: pStatus.cancelled || 0, fill: '#ef4444' },
  ];

  const taskStatusData = [
    { name: 'To Do', count: tStatus.to_do || 0, fill: '#94a3b8' },
    { name: 'In Progress', count: tStatus.in_progress || 0, fill: '#3b82f6' },
    { name: 'In Review', count: tStatus.in_review || 0, fill: '#8b5cf6' },
    { name: 'Completed', count: tStatus.completed || 0, fill: '#10b981' },
    { name: 'Blocked', count: tStatus.blocked || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with CSV Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analytics & Executive Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculated health metrics, velocity distribution, and sanitized CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCSV('projects')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Projects CSV
          </button>
          <button
            onClick={() => handleDownloadCSV('tasks')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Tasks CSV
          </button>
        </div>
      </div>

      {/* High-level KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Total Deliverables</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalTasks} Tasks
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
            {completedTasks} completed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Backlog Ratio</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Task Completion Rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">At-Risk Projects</span>
          <span className="text-2xl font-extrabold text-amber-600">
            {healthCounts.at_risk || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Due in &le; 3 days or delayed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Critical Overdue</span>
          <span className="text-2xl font-extrabold text-rose-600">
            {overdueTasks} Tasks
          </span>
          <span className="text-[11px] text-rose-500 mt-1 block font-medium">Missed Deadline</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Projects by Lifecycle Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Tasks by Execution Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Productivity Table */}
      {teamReports && teamReports.teamPerformance && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Team Member Productivity & Workload
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Total Assigned</th>
                  <th className="pb-3 font-semibold">Completed</th>
                  <th className="pb-3 font-semibold">Pending</th>
                  <th className="pb-3 font-semibold">Completion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teamReports.teamPerformance.map((member: any) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {member.name}
                    </td>
                    <td className="py-3 capitalize text-slate-500">
                      {member.role?.replace('_', ' ')}
                    </td>
                    <td className="py-3 font-bold">{member.totalTasks}</td>
                    <td className="py-3 text-emerald-600 font-semibold">{member.completedTasks}</td>
                    <td className="py-3 text-blue-600">{member.pendingTasks}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold">{member.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
