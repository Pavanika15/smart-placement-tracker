import express from 'express';
import {
  applyToCompany,
  getApplicationsByStudent,
  updateApplicationStatus,
  getAllApplications,
} from '../controllers/applicationController.js';

import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student applies to a company
router.post('/apply', protect, authorize('student'), applyToCompany);

// Get all applications for a student
router.get('/student', protect, authorize("student"), getApplicationsByStudent)


;router.get("/all", protect, authorize("admin"), getAllApplications);



// Admin updates application status
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  updateApplicationStatus
);

export default router;