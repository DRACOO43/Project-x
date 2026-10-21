import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.ts';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.get('/:id', getProjectById);

// Project creation: Admin and Project Managers
router.post(
  '/',
  authorizeRoles('admin', 'project_manager'),
  validate([
    body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 120 }),
    body('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate(),
    body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().toDate(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority value'),
    body('status')
      .optional()
      .isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
  ]),
  createProject
);

router.patch(
  '/:id',
  validate([
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('startDate').optional().isISO8601().toDate(),
    body('dueDate').optional().isISO8601().toDate(),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical']),
    body('status')
      .optional()
      .isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  ]),
  updateProject
);

router.delete('/:id', deleteProject);

// Member management
router.post(
  '/:id/members',
  validate([body('userId').notEmpty().withMessage('User ID is required')]),
  addProjectMember
);

router.delete('/:id/members/:userId', removeProjectMember);

export default router;
