import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  Layers,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const NotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      showToast('Could not load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (e) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const displayedList =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Database-backed audit notifications for assigned tasks, deadlines, and project events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description={
            filter === 'unread'
              ? 'You have caught up with all unread notifications.'
              : 'You will receive notifications when tasks are assigned or deadlines approach.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {displayedList.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) handleMarkRead(notif._id);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.isRead
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    !notif.isRead ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notif._id);
                  }}
                  className="p-1 rounded-lg hover:bg-blue-100 text-blue-600 text-xs font-semibold"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
