import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_platform_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = '7d';

const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await dataStore.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address is already registered.',
      });
      return;
    }

    // Role safety check: Public registrations cannot grant admin rights
    // Default to 'team_member' or 'project_manager'
    const assignedRole = role === 'project_manager' ? 'project_manager' : 'team_member';

    const newUser = await dataStore.createUser({
      name,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    // HttpOnly Cookie configuration
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const user = await dataStore.findUserByEmail(email, true);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact an administrator for assistance.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await dataStore.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const switchDemoUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'admin@smartpm.local';
    if (role === 'project_manager') targetEmail = 'pm@smartpm.local';
    if (role === 'team_member') targetEmail = 'member@smartpm.local';

    const user = await dataStore.findUserByEmail(targetEmail, false);
    if (!user) {
      res.status(404).json({ success: false, message: 'Demo account not found' });
      return;
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: `Switched demo account to ${user.name} (${user.role})`,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
