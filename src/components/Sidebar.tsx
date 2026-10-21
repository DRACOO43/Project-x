import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  X,
  Layers,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', to: '/projects', icon: FolderKanban },
    { label: 'Tasks', to: '/tasks', icon: CheckSquare },
    { label: 'Team Members', to: '/team', icon: Users },
    { label: 'Calendar', to: '/calendar', icon: Calendar },
    { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs animate-in fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block">
                Project <span className="text-blue-600">X</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1 uppercase tracking-wider">
                MERN Enterprise
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Database status widget */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 mb-1.5 text-slate-700 dark:text-slate-200 font-semibold text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>MongoDB Engine</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mongoose Models Active</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 leading-tight">
              Role: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
