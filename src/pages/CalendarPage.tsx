import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api.ts';
import { TaskDetailsModal } from '../components/TaskDetailsModal.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
      if (projRes.data.success) setProjects(projRes.data.projects || []);
      if (taskRes.data.success) setTasks(taskRes.data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get items for a specific date
  const getItemsForDay = (day: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayProjects = projects.filter((p) => {
      const dueStr = new Date(p.dueDate).toISOString().split('T')[0];
      return dueStr === targetDateStr;
    });

    const dayTasks = tasks.filter((t) => {
      const dueStr = new Date(t.dueDate).toISOString().split('T')[0];
      return dueStr === targetDateStr;
    });

    return { dayProjects, dayTasks };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendar & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming project milestones, release dates, and task completion deadlines.
          </p>
        </div>

        {/* Navigation month controller */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Day Names Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 py-3">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800 min-h-[500px]">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="p-2 bg-slate-50/30 dark:bg-slate-900/20" />;
            }

            const { dayProjects, dayTasks } = getItemsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`p-2 min-h-[100px] flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {dayProjects.map((p) => (
                    <div
                      key={p._id}
                      className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold truncate"
                      title={`Project Due: ${p.title}`}
                    >
                      📁 {p.title}
                    </div>
                  ))}

                  {dayTasks.map((t) => {
                    const isOverdue =
                      t.status !== 'completed' && new Date(t.dueDate) < new Date();
                    return (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTaskId(t._id)}
                        className={`p-1 rounded text-[10px] font-medium truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                          isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : t.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200'
                        }`}
                        title={`Task: ${t.title}`}
                      >
                        ✓ {t.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={fetchData}
      />
    </div>
  );
};
