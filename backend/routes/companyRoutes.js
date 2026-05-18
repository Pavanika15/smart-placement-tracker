import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';

import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// All authenticated users
router.get('/', protect, getCompanies);
router.get('/:id', protect, getCompanyById);

// Admin only
router.post('/', protect, authorize('admin'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

export default router;