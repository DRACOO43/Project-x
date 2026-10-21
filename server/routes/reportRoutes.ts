import { Router } from 'express';
import {
  getProjectReports,
  getTaskReports,
  getTeamReports,
  exportCSV,
} from '../controllers/reportController.ts';
import { authenticateJWT } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateJWT);

router.get('/projects', getProjectReports);
router.get('/tasks', getTaskReports);
router.get('/team', getTeamReports);
router.get('/export/csv', exportCSV);

export default router;
