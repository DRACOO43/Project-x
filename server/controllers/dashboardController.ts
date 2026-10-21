import { Response, NextFunction } from 'express';
import { dataStore } from '../services/dataStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await dataStore.getDashboardSummary(req.user!);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
