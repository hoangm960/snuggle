import { Router } from 'express';
import {
  register,
  login,
  googleSignIn,
  createUserProfile,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.post('/profile', authenticate, createUserProfile);
router.get('/me', authenticate, verifyToken);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.delete('/account', authenticate, deleteUserAccount);

export default router;
