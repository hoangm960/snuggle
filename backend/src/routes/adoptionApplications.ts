import { Router } from 'express';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/adoptionApplicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllApplications);
router.get('/:id', getApplicationById);
router.post('/', authenticate, createApplication);
router.put('/:id/status', authenticate, updateApplicationStatus);
router.delete('/:id', authenticate, deleteApplication);

export default router;
