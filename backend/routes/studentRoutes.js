import express from 'express';
import {
  createStudent,
  getStudents,
  getEligibleStudents,
} from '../controllers/studentController.js';

import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin only
router.post('/', protect, authorize('admin'), createStudent);
router.get('/', protect, authorize('admin'), getStudents);
router.get(
  '/eligible/:companyId',
  protect,
  authorize('admin'),
  getEligibleStudents
);

export default router;