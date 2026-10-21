import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  FolderKanban,
  Send,
  MessageSquare,
  Trash2,
  Edit,
  Tag,
} from 'lucide-react';
import api from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

interface TaskDetailsModalProps {
  taskId: string | null;
  onClose: () => void;
  onUpdated: () => void;
  onEditTask?: (task: any) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  taskId,
  onClose,
  onUpdated,
  onEditTask,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${taskId}`);
      if (res.data.success) {
        setTask(res.data.task);
      }
    } catch (err: any) {
      showToast('Could not load task details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId]);

  if (!taskId) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      fetchTask();
      onUpdated();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { text: commentText.trim() });
      if (res.data.success) {
        setCommentText('');
        fetchTask();
        showToast('Comment posted', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const isOverdue =
    task && task.status !== 'completed' && new Date(task.dueDate) < new Date();

  const canEditDetails =
    user?.role === 'admin' ||
    user?.role === 'project_manager' ||
    (task?.createdBy?._id || task?.createdBy || '').toString() === user?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Details
            </span>
            {isOverdue && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                OVERDUE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !task ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading task details...
          </div>
        ) : (
          <div className="mt-4 space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Title & Priority */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <StatusBadge type="priority" value={task.priority} />
                <StatusBadge type="status" value={task.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {task.title}
              </h2>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No detailed instructions provided for this task.'}
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {task.labels.map((lbl: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {lbl}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned To</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {task.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Parent Project</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {task.project?.title || 'Project'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Due Date</span>
                <span className={`font-semibold mt-0.5 block ${isOverdue ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Effort Est.</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {task.estimatedEffort || 1} hrs
                </span>
              </div>
            </div>

            {/* Quick Status Transition (All roles can update status) */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Update Status
              </span>
              <div className="flex flex-wrap gap-2">
                {['to_do', 'in_progress', 'in_review', 'completed', 'blocked'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      task.status === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Thread Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Discussion & Updates ({(task.comments || []).length})
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {(task.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 italic">
                    No comments yet. Start the conversation below.
                  </p>
                ) : (
                  task.comments.map((comment: any, idx: number) => (
                    <div
                      key={comment._id || idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {comment.user?.name || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add an update or question..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
