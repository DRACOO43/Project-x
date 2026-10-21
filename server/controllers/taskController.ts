import { Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, status, priority, assignedTo, search } = req.query as any;
    const tasks = await dataStore.getTasks(req.user!, {
      projectId,
      status,
      priority,
      assignedTo,
      search,
    });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await dataStore.getTaskById(id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      estimatedEffort,
      labels,
    } = req.body;

    const project = await dataStore.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: 'Specified project does not exist.' });
      return;
    }

    // Role verification: Admin or PM or project member can create tasks
    const isOwner = (project.owner?._id || project.owner || '').toString() === req.user!.id;
    const isMember = (project.members || []).some(
      (m: any) => (m?._id || m || '').toString() === req.user!.id
    );

    if (req.user!.role !== 'admin' && !isOwner && !isMember) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to create tasks in this project.',
      });
      return;
    }

    // Validate assignee belongs to the project
    if (assignedTo) {
      const memberIds = (project.members || []).map((m: any) => (m._id || m.id || m).toString());
      const ownerId = (project.owner?._id || project.owner || '').toString();
      if (!memberIds.includes(assignedTo) && ownerId !== assignedTo) {
        res.status(400).json({
          success: false,
          message: 'Assignee must be an active member of this project.',
        });
        return;
      }
    }

    const task = await dataStore.createTask({
      title,
      description: description || '',
      project: projectId,
      assignedTo: assignedTo || undefined,
      createdBy: req.user!.id,
      priority: priority || 'medium',
      status: status || 'to_do',
      startDate: startDate ? new Date(startDate) : new Date(),
      dueDate: new Date(dueDate),
      estimatedEffort: estimatedEffort ? Number(estimatedEffort) : 1,
      labels: Array.isArray(labels) ? labels : labels ? [labels] : [],
    });

    // Notify assignee
    if (assignedTo && assignedTo !== req.user!.id) {
      await dataStore.createNotification(
        assignedTo,
        'task_assigned',
        `${req.user!.name} assigned you to task "${title}"`,
        projectId,
        task._id.toString()
      );
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await dataStore.getTaskById(id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      estimatedEffort,
      labels,
    } = req.body;

    const isCreator = (task.createdBy?._id || task.createdBy || '').toString() === req.user!.id;
    const isAssigned = (task.assignedTo?._id || task.assignedTo || '').toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const isPM = req.user!.role === 'project_manager';

    // Permission rules:
    // If team_member and not creator: can only update status
    if (!isAdmin && !isCreator && !isPM) {
      if (title || priority || dueDate || assignedTo) {
        res.status(403).json({
          success: false,
          message: 'Team members are only authorized to update task status and add comments.',
        });
        return;
      }
    }

    const oldStatus = task.status;
    const updated = await dataStore.updateTask(id, {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(estimatedEffort !== undefined && { estimatedEffort: Number(estimatedEffort) }),
      ...(labels && { labels }),
    });

    // If task was marked completed, notify creator
    if (status === 'completed' && oldStatus !== 'completed') {
      const creatorId = (task.createdBy?._id || task.createdBy || '').toString();
      if (creatorId && creatorId !== req.user!.id) {
        await dataStore.createNotification(
          creatorId,
          'task_completed',
          `${req.user!.name} marked task "${task.title}" as completed`,
          (task.project?._id || task.project || '').toString(),
          id
        );
      }
    }

    // If newly assigned, notify
    if (assignedTo && assignedTo !== (task.assignedTo?._id || task.assignedTo || '').toString()) {
      if (assignedTo !== req.user!.id) {
        await dataStore.createNotification(
          assignedTo,
          'task_assigned',
          `${req.user!.name} assigned you to task "${task.title}"`,
          (task.project?._id || task.project || '').toString(),
          id
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await dataStore.getTaskById(id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const isCreator = (task.createdBy?._id || task.createdBy || '').toString() === req.user!.id;
    if (req.user!.role !== 'admin' && req.user!.role !== 'project_manager' && !isCreator) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this task.',
      });
      return;
    }

    await dataStore.deleteTask(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
      return;
    }

    const task = await dataStore.getTaskById(id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const updated = await dataStore.addComment(id, req.user!.id, text.trim());

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      task: updated,
    });
  } catch (error) {
    next(error);
  }
};
