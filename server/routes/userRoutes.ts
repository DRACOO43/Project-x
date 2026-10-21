import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
} from '../controllers/userController.ts';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/', getUsers);
router.get('/:id', getUserById);

router.patch(
  '/:id',
  validate([
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  ]),
  updateUser
);

// Admin-only role & activation management
router.patch(
  '/:id/role',
  authorizeRoles('admin'),
  validate([
    body('role')
      .optional()
      .isIn(['admin', 'project_manager', 'team_member'])
      .withMessage('Invalid role specified'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ]),
  updateUserRole
);

export default router;
