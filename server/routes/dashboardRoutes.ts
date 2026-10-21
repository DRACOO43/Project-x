import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.ts';
import { authenticateJWT } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJWT);
router.get('/summary', getDashboardSummary);

export default router;
