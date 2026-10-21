import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
} from '../controllers/taskController.ts';
import { authenticateJWT } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTasks);
router.get('/:id', getTaskById);

router.post(
  '/',
  validate([
    body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 160 }),
    body('project').notEmpty().withMessage('Project identifier is required'),
    body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().toDate(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']),
    body('status')
      .optional()
      .isIn(['to_do', 'in_progress', 'in_review', 'completed', 'blocked']),
  ]),
  createTask
);

router.patch(
  '/:id',
  validate([
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']),
    body('status')
      .optional()
      .isIn(['to_do', 'in_progress', 'in_review', 'completed', 'blocked']),
  ]),
  updateTask
);

router.delete('/:id', deleteTask);

router.post(
  '/:id/comments',
  validate([
    body('text').trim().notEmpty().withMessage('Comment message text is required').isLength({ max: 1000 }),
  ]),
  addTaskComment
);

export default router;
