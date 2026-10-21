import { Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, search, sortBy } = req.query as any;
    const projects = await dataStore.getProjects(req.user!, { status, priority, search });

    // Client-side sorting on backend
    if (sortBy === 'dueDate') {
      projects.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else if (sortBy === 'oldest') {
      projects.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'priority') {
      const pMap: any = { critical: 4, high: 3, medium: 2, low: 1 };
      projects.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
    } else {
      // Default: newest
      projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await dataStore.getProjectById(id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // Role check: Admin can view all. Others must be owner or member
    if (req.user!.role !== 'admin') {
      const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
      const isMember = (project.members || []).some(
        (m: any) => (m?._id || m || '').toString() === req.user!.id
      );
      if (!isOwner && !isMember) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not a member of this project.',
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, startDate, dueDate, priority, status, members } = req.body;

    // Validate dates: due date cannot be earlier than start date
    const start = new Date(startDate || Date.now());
    const due = new Date(dueDate);

    if (due < start) {
      res.status(400).json({
        success: false,
        message: 'Project due date cannot be earlier than start date.',
      });
      return;
    }

    const created = await dataStore.createProject({
      title,
      description: description || '',
      owner: req.user!.id,
      members: members || [],
      startDate: start,
      dueDate: due,
      priority: priority || 'medium',
      status: status || 'planning',
    });

    // Notify added members
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        if (memberId !== req.user!.id) {
          await dataStore.createNotification(
            memberId,
            'member_added',
            `${req.user!.name} added you to project "${title}"`,
            created._id.toString()
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: created,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await dataStore.getProjectById(id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // Permission check: Admin or owner can update
    const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
    if (req.user!.role !== 'admin' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Only the project owner or an administrator can modify this project.',
      });
      return;
    }

    const { title, description, startDate, dueDate, priority, status, members } = req.body;

    if (startDate && dueDate) {
      if (new Date(dueDate) < new Date(startDate)) {
        res.status(400).json({
          success: false,
          message: 'Project due date cannot be earlier than start date.',
        });
        return;
      }
    }

    const updated = await dataStore.updateProject(id, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(members && { members }),
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await dataStore.getProjectById(id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    // Permission check: Admin or owner
    const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
    if (req.user!.role !== 'admin' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Only the project owner or an administrator can delete this project.',
      });
      return;
    }

    await dataStore.deleteProject(id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await dataStore.getProjectById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
    if (req.user!.role !== 'admin' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Only the project owner or an administrator can manage team members.',
      });
      return;
    }

    const currentMembers = (project.members || []).map((m: any) => (m._id || m.id || m).toString());
    if (currentMembers.includes(userId)) {
      res.status(400).json({
        success: false,
        message: 'User is already a member of this project.',
      });
      return;
    }

    const newMembers = [...currentMembers, userId];
    const updated = await dataStore.updateProject(id, { members: newMembers });

    await dataStore.createNotification(
      userId,
      'member_added',
      `${req.user!.name} added you to project "${project.title}"`,
      id
    );

    res.status(200).json({
      success: true,
      message: 'Team member added successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, userId } = req.params;

    const project = await dataStore.getProjectById(id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
    if (req.user!.role !== 'admin' && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Only the project owner or an administrator can manage team members.',
      });
      return;
    }

    const currentMembers = (project.members || []).map((m: any) => (m._id || m.id || m).toString());
    const newMembers = currentMembers.filter((m: string) => m !== userId);

    const updated = await dataStore.updateProject(id, { members: newMembers });

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};
