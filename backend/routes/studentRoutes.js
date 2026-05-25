import express from 'express';
import {
  createStudent,
  getCurrentStudent,
  updateStudent,
  updateStudentByAdmin,
  deleteStudentByAdmin,
  getStudents,
  getEligibleStudents,
} from '../controllers/studentController.js';

import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student profile endpoints
router.post('/', protect, authorize('student'), createStudent);
router.get('/me', protect, authorize('student'), getCurrentStudent);
router.put('/me', protect, authorize('student'), updateStudent);

// Admin only
router.get('/', protect, authorize('admin'), getStudents);
router.put('/:id', protect, authorize('admin'), updateStudentByAdmin);
router.delete('/:id', protect, authorize('admin'), deleteStudentByAdmin);
router.get(
  '/eligible/:companyId',
  protect,
  authorize('admin'),
  getEligibleStudents
);

export default router;