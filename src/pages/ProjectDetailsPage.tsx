import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Users,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserPlus,
  X,
} from 'lucide-react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ProjectModal } from '../components/ProjectModal.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Edit / Delete modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
        setTasks(res.data.project.tasks || []);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load project details', 'error');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const handleOpenAddMember = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        // Filter out existing members
        const currentIds = (project.members || []).map((m: any) => (m._id || m.id || m).toString());
        const candidates = res.data.users.filter(
          (u: any) => !currentIds.includes((u._id || u.id).toString())
        );
        setAllUsers(candidates);
        if (candidates.length > 0) setSelectedUserId((candidates[0]._id || candidates[0].id).toString());
        setShowAddMemberModal(true);
      }
    } catch (e) {
      showToast('Could not load user list', 'error');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserId });
      showToast('Member added to project', 'success');
      setShowAddMemberModal(false);
      fetchProjectDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add member', 'error');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      showToast('Member removed from project', 'info');
      fetchProjectDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove member', 'error');
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      showToast('Project deleted successfully', 'success');
      navigate('/projects');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const isOwnerOrAdmin =
    user?.role === 'admin' ||
    (project.owner?._id || project.owner || '').toString() === user?.id;

  return (
    <div className="space-y-6">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Main Project Hero Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge type="priority" value={project.priority} />
              <StatusBadge type="status" value={project.status} />
              <StatusBadge type="health" value={project.health} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 min-w-[200px] text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Automated Progress
            </span>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 my-1 block">
              {project.progress}%
            </span>
            <span className="text-xs text-slate-500">
              {project.completedTasks} / {project.totalTasks} Tasks Done
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Owner / Lead</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
              {project.owner?.name || 'Assigned Lead'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Start Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {new Date(project.startDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Target Due Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {new Date(project.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Overdue Milestones</span>
            <span className={`font-bold mt-0.5 block ${project.overdueTasks > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {project.overdueTasks || 0} Tasks
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Team Members & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List Column */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Team Members ({(project.members || []).length})
              </h2>
            </div>
            {isOwnerOrAdmin && (
              <button
                onClick={handleOpenAddMember}
                className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950 dark:hover:bg-blue-900 text-xs font-semibold flex items-center gap-1"
                title="Add Member"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(project.members || []).map((m: any) => {
              const mId = (m._id || m.id || m).toString();
              const isLead = (project.owner?._id || project.owner || '').toString() === mId;
              return (
                <div key={mId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px]">
                      {(m.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {m.name || 'Member'}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {isLead ? '★ Project Owner' : m.role?.replace('_', ' ') || 'Team Member'}
                      </span>
                    </div>
                  </div>

                  {isOwnerOrAdmin && !isLead && (
                    <button
                      onClick={() => handleRemoveMember(mId)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Tasks List Column */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Tasks ({tasks.length})
            </h2>
            <Link
              to={`/tasks?projectId=${id}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Open in Tasks Board →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No tasks have been assigned to this project yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task: any) => (
                <div
                  key={task._id}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {task.title}
                      </span>
                      <StatusBadge type="priority" value={task.priority} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
                      <span>•</span>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <StatusBadge type="status" value={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Add Member to Project
            </h3>
            {allUsers.length === 0 ? (
              <p className="text-xs text-slate-500 mb-4">
                All registered platform users are already assigned to this project.
              </p>
            ) : (
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {allUsers.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.role?.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditOpen}
        projectToEdit={project}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchProjectDetails}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Project?"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be reversed.`}
        confirmLabel="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteProject}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
