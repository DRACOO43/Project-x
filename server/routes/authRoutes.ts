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
    body('email').trim().notEmpty().withMessage('Email address is required'),
    body('password')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Password must be at least 3 characters long'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').trim().notEmpty().withMessage('Please enter your email or username'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.get('/me', authenticateJWT, getMe);
router.post('/logout', logout);
router.post('/switch-demo', switchDemoUser);

export default router;
