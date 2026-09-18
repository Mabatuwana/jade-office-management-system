import { Router } from 'express';
import {
  getExecutiveOverview,
  getDepartmentMetrics,
  updateMetric,
} from '../controllers/metricsController.js';
import { authenticateJWT, requireRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

// Executive overview restricted to MD
router.get(
  '/executive',
  requireRoles(['MANAGING_DIRECTOR'], false),
  getExecutiveOverview
);

router.get('/department/:department', getDepartmentMetrics);
router.patch('/:id', updateMetric);

export default router;
