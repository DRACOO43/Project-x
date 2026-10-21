import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, Clock, Mail, ShieldAlert, UserCheck } from 'lucide-react';
import api from '../services/api.ts';
import { useAuth, UserRole } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setTeamMembers(res.data.users || []);
      }
    } catch (e) {
      showToast('Failed to load team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      showToast('User role updated successfully', 'success');
      fetchTeam();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}/role`, { isActive: !currentStatus });
      showToast(`Account ${!currentStatus ? 'activated' : 'deactivated'}`, 'info');
      fetchTeam();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Team Members Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Workload distribution, role authorizations, and individual task metrics across projects.
          </p>
        </div>

        {isAdmin && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800">
            <Shield className="w-3.5 h-3.5" />
            Admin Role Controls Active
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member) => {
            const mId = member._id || member.id;
            return (
              <div
                key={mId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        (member.name || 'U').charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {member.name}
                      </h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : member.role === 'project_manager'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {member.role?.replace('_', ' ')}
                  </span>
                </div>

                {/* Task Workload Metrics */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Projects</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">
                      {member.projectCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Tasks</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {member.pendingTasksCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Completed</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {member.completedTasksCount || 0}
                    </span>
                  </div>
                </div>

                {/* Admin Role Alteration Selector */}
                {isAdmin && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Change Role:</span>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(mId, e.target.value as UserRole)}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="admin">Admin</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
