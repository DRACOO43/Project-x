import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, logout, switchDemoUser } from '../controllers/authController.ts';
import { authenticateJWT } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';

const router = Router();

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 60 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.get('/me', authenticateJWT, getMe);
router.post('/logout', logout);
router.post('/switch-demo', switchDemoUser);

export default router;
