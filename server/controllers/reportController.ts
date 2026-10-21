import { Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

// Helper to sanitize CSV field to prevent formula injection and escape delimiters
const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) return '""';
  let str = String(field).trim();
  // Prevent CSV Injection (=, +, -, @)
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  // Double-quote quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
};

export const getProjectReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await dataStore.getProjects(req.user!);

    const statusCounts = {
      planning: projects.filter((p) => p.status === 'planning').length,
      in_progress: projects.filter((p) => p.status === 'in_progress').length,
      on_hold: projects.filter((p) => p.status === 'on_hold').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      cancelled: projects.filter((p) => p.status === 'cancelled').length,
    };

    const healthCounts = {
      on_track: projects.filter((p) => p.health === 'on_track').length,
      at_risk: projects.filter((p) => p.health === 'at_risk').length,
      delayed: projects.filter((p) => p.health === 'delayed').length,
      completed: projects.filter((p) => p.health === 'completed').length,
    };

    const priorityCounts = {
      critical: projects.filter((p) => p.priority === 'critical').length,
      high: projects.filter((p) => p.priority === 'high').length,
      medium: projects.filter((p) => p.priority === 'medium').length,
      low: projects.filter((p) => p.priority === 'low').length,
    };

    res.status(200).json({
      success: true,
      totalProjects: projects.length,
      statusCounts,
      healthCounts,
      priorityCounts,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tasks = await dataStore.getTasks(req.user!);
    const now = new Date();

    const statusCounts = {
      to_do: tasks.filter((t) => t.status === 'to_do').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      in_review: tasks.filter((t) => t.status === 'in_review').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
    };

    const overdueCount = tasks.filter(
      (t) => t.status !== 'completed' && new Date(t.dueDate) < now
    ).length;

    res.status(200).json({
      success: true,
      totalTasks: tasks.length,
      completedTasks: statusCounts.completed,
      pendingTasks: tasks.length - statusCounts.completed,
      overdueTasks: overdueCount,
      statusCounts,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await dataStore.findUsers();
    const tasks = await dataStore.getTasks(req.user!);

    const teamPerformance = users.map((u: any) => {
      const uId = (u._id || u.id).toString();
      const userTasks = tasks.filter(
        (t: any) => (t.assignedTo?._id || t.assignedTo || '').toString() === uId
      );
      const completed = userTasks.filter((t: any) => t.status === 'completed').length;
      const total = userTasks.length;
      const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        id: uId,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: total - completed,
        completionRate: rate,
      };
    });

    res.status(200).json({
      success: true,
      teamPerformance,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = req.query.type as string; // 'projects' or 'tasks'

    if (type === 'projects') {
      const projects = await dataStore.getProjects(req.user!);
      const headers = ['Project Title', 'Status', 'Priority', 'Progress (%)', 'Health', 'Start Date', 'Due Date', 'Total Tasks', 'Completed Tasks'];
      const rows = projects.map((p) => [
        escapeCSVField(p.title),
        escapeCSVField(p.status),
        escapeCSVField(p.priority),
        escapeCSVField(p.progress),
        escapeCSVField(p.health),
        escapeCSVField(new Date(p.startDate).toISOString().split('T')[0]),
        escapeCSVField(new Date(p.dueDate).toISOString().split('T')[0]),
        escapeCSVField(p.totalTasks),
        escapeCSVField(p.completedTasks),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="smart-pm-projects-report.csv"');
      res.status(200).send(csvContent);
      return;
    }

    // Default: Tasks CSV
    const tasks = await dataStore.getTasks(req.user!);
    const headers = ['Task Title', 'Project', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Effort (Hours)'];
    const rows = tasks.map((t) => [
      escapeCSVField(t.title),
      escapeCSVField(t.project?.title || 'Unassigned'),
      escapeCSVField(t.status),
      escapeCSVField(t.priority),
      escapeCSVField(t.assignedTo?.name || 'Unassigned'),
      escapeCSVField(new Date(t.dueDate).toISOString().split('T')[0]),
      escapeCSVField(t.estimatedEffort || 0),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="smart-pm-tasks-report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
