import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Users,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ProjectModal } from '../components/ProjectModal.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const ProjectsListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects', {
        params: {
          search: search || undefined,
          status: statusFilter,
          priority: priorityFilter,
          sortBy,
        },
      });
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setCurrentPage(1);
  }, [search, statusFilter, priorityFilter, sortBy]);

  const handleDeleteProject = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${deleteCandidate._id || deleteCandidate.id}`);
      showToast('Project deleted successfully', 'success');
      setDeleteCandidate(null);
      fetchProjects();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete project.';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'project_manager';

  // Pagination slice
  const totalPages = Math.ceil(projects.length / itemsPerPage) || 1;
  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage timelines, team members, milestone deliverables, and automated progress rates.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {/* Projects Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : paginatedProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Projects Found"
          description="Try adjusting your filters or search terms, or create a new project to get started."
          actionLabel={canCreate ? 'Create First Project' : undefined}
          onAction={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProjects.map((project) => {
            const pId = project._id || project.id;
            const isOwnerOrAdmin =
              user?.role === 'admin' ||
              (project.owner?._id || project.owner || '').toString() === user?.id;

            return (
              <div
                key={pId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StatusBadge type="priority" value={project.priority} />
                    <StatusBadge type="health" value={project.health} />
                  </div>

                  <Link to={`/projects/${pId}`} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {project.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Progress Bar (Dynamic formula) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Progress ({project.completedTasks || 0}/{project.totalTasks || 0} tasks)
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Date & Team Members Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {(project.members || []).slice(0, 3).map((m: any, idx: number) => (
                        <div
                          key={idx}
                          title={m.name || 'Member'}
                          className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-900 text-[10px] font-bold text-slate-800 dark:text-white flex items-center justify-center"
                        >
                          {(m.name || 'U').charAt(0)}
                        </div>
                      ))}
                      {(project.members || []).length > 3 && (
                        <span className="text-[10px] pl-1 font-semibold text-slate-400">
                          +{project.members.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <Link
                      to={`/projects/${pId}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Open Project
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {isOwnerOrAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Project"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(project)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, projects.length)} of {projects.length} projects
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        projectToEdit={editingProject}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />

      <ConfirmModal
        isOpen={!!deleteCandidate}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${deleteCandidate?.title}"? All associated tasks and milestones will be deleted.`}
        confirmLabel="Delete Project"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteProject}
        onClose={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
