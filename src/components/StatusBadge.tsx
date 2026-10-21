import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle,
  ShieldAlert,
} from 'lucide-react';

interface StatusBadgeProps {
  type: 'status' | 'priority' | 'health';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const norm = (value || '').toLowerCase().replace(/\s+/g, '_');
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  if (type === 'health') {
    switch (norm) {
      case 'on_track':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            On Track
          </span>
        );
      case 'at_risk':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            At Risk
          </span>
        );
      case 'delayed':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 ${sizeClasses}`}>
            <XCircle className="w-3 h-3 text-rose-500" />
            Delayed
          </span>
        );
      case 'completed':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 ${sizeClasses}`}>
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  if (type === 'priority') {
    switch (norm) {
      case 'critical':
        return (
          <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${sizeClasses}`}>
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Critical
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800 ${sizeClasses}`}>
            High
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${sizeClasses}`}>
            Medium
          </span>
        );
      case 'low':
        return (
          <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}>
            Low
          </span>
        );
      default:
        return <span className={`rounded-md bg-slate-100 ${sizeClasses}`}>{value}</span>;
    }
  }

  // Type === 'status'
  switch (norm) {
    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Completed
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${sizeClasses}`}>
          <PlayCircle className="w-3 h-3 text-blue-500" />
          In Progress
        </span>
      );
    case 'in_review':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-purple-500" />
          In Review
        </span>
      );
    case 'planning':
    case 'to_do':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-slate-400" />
          {norm === 'planning' ? 'Planning' : 'To Do'}
        </span>
      );
    case 'on_hold':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${sizeClasses}`}>
          <PauseCircle className="w-3 h-3 text-amber-500" />
          On Hold
        </span>
      );
    case 'blocked':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${sizeClasses}`}>
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Blocked
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ${sizeClasses}`}>
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {value}
        </span>
      );
  }
};
