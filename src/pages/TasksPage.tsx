import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Calendar,
  Clock,
  User as UserIcon,
  AlertTriangle,
  FolderKanban,
} from 'lucide-react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { TaskModal } from '../components/TaskModal.tsx';
import { TaskDetailsModal } from '../components/TaskDetailsModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('projectId') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchFiltersData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
      if (projRes.data.success) setProjects(projRes.data.projects || []);
      if (userRes.data.success) setUsers(userRes.data.users || []);
    } catch (e) {
      // Ignore
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', {
        params: {
          search: search || undefined,
          projectId: projectFilter !== 'all' ? projectFilter : undefined,
          status: statusFilter,
          priority: priorityFilter,
          assignedTo: assigneeFilter,
        },
      });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [search, projectFilter, statusFilter, priorityFilter, assigneeFilter]);

  const kanbanColumns = [
    { id: 'to_do', title: 'To Do', color: 'bg-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'in_review', title: 'In Review', color: 'bg-purple-500' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
    { id: 'blocked', title: 'Blocked', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize team deliverables, adjust sprint states, and inspect discussion notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main View: Kanban vs Table */}
      {loading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description="Create your first task or change filter criteria."
          actionLabel="Create Task"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800 flex flex-col min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[11px] text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Empty
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const isOverdue =
                        t.status !== 'completed' && new Date(t.dueDate) < new Date();
                      return (
                        <div
                          key={t._id}
                          onClick={() => setSelectedTaskId(t._id)}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <StatusBadge type="priority" value={t.priority} />
                            {isOverdue && (
                              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {t.title}
                          </h4>

                          <div className="text-[10px] text-slate-400 font-medium truncate">
                            📁 {t.project?.title || 'Project'}
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(t.dueDate).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>

                            <div
                              title={`Assigned to ${t.assignedTo?.name || 'Unassigned'}`}
                              className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px] flex items-center justify-center"
                            >
                              {(t.assignedTo?.name || 'U').charAt(0)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Project</th>
                <th className="pb-3 font-semibold">Assignee</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((t) => {
                const isOverdue =
                  t.status !== 'completed' && new Date(t.dueDate) < new Date();
                return (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTaskId(t._id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 truncate">
                      {t.project?.title || 'Unassigned'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {t.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3">
                      <StatusBadge type="priority" value={t.priority} />
                    </td>
                    <td className="py-3">
                      <StatusBadge type="status" value={t.status} />
                    </td>
                    <td className={`py-3 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isCreateOpen}
        defaultProjectId={projectFilter !== 'all' ? projectFilter : undefined}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTasks}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={fetchTasks}
      />
    </div>
  );
};
