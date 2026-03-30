import { Router } from 'express';
import {
  verifyToken,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, verifyToken);
router.post('/profile', authenticate, createUserProfile);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

export default router;
