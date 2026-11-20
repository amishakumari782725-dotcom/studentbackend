import express from 'express';
import {
  getDashboardStats,
  getDashboardDistribution,
  getRecentStudents,
  getRecentActivities,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/distribution', protect, getDashboardDistribution);
router.get('/recent-students', protect, getRecentStudents);
router.get('/recent-activities', protect, getRecentActivities);

export default router;
