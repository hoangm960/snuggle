import { Router } from 'express';
import {
  getAdopterProfile,
  createAdopterProfile,
  updateAdopterProfile,
} from '../controllers/adopterProfileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAdopterProfile);
router.post('/', authenticate, createAdopterProfile);
router.put('/', authenticate, updateAdopterProfile);

export default router;
