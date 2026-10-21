import { Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role } = req.query as { search?: string; role?: string };
    const users = await dataStore.findUsers({ search, role });

    // Enrich users with project and task counts
    const allProjects = await dataStore.getProjects({ id: req.user!.id, role: 'admin' });
    const allTasks = await dataStore.getTasks({ id: req.user!.id, role: 'admin' });

    const enriched = users.map((u: any) => {
      const uId = (u._id || u.id).toString();
      const userProjects = allProjects.filter((p: any) =>
        (p.members || []).some((m: any) => (m._id || m.id || m).toString() === uId)
      );
      const userTasks = allTasks.filter(
        (t: any) => (t.assignedTo?._id || t.assignedTo || '').toString() === uId
      );
      const completedTasks = userTasks.filter((t: any) => t.status === 'completed').length;
      const pendingTasks = userTasks.filter((t: any) => t.status !== 'completed').length;

      return {
        ...u,
        projectCount: userProjects.length,
        taskCount: userTasks.length,
        completedTasksCount: completedTasks,
        pendingTasksCount: pendingTasks,
      };
    });

    res.status(200).json({
      success: true,
      users: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await dataStore.findUserById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;

    // Users can only update their own profile unless admin
    if (req.user!.role !== 'admin' && req.user!.id !== id) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another user profile.',
      });
      return;
    }

    const updated = await dataStore.updateUser(id, { name, avatar });
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Admin only
    if (req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only administrators can alter user roles or account statuses.',
      });
      return;
    }

    const updateFields: any = {};
    if (role && ['admin', 'project_manager', 'team_member'].includes(role)) {
      updateFields.role = role;
    }
    if (typeof isActive === 'boolean') {
      updateFields.isActive = isActive;
    }

    const updated = await dataStore.updateUser(id, updateFields);
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User permissions updated successfully',
      user: updated,
    });
  } catch (error) {
    next(error);
  }
};
