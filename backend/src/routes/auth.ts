import { Router } from 'express';
import {
  register,
  login,
  googleSignIn,
  facebookSignIn,
  createUserProfile,
  verifyToken,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  resendVerification,
  verifyEmail,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.post('/facebook', facebookSignIn);
router.post('/resend-verification', resendVerification);
router.post('/verify-email', verifyEmail);
router.post('/profile', authenticate, createUserProfile);
router.get('/me', authenticate, verifyToken);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.delete('/account', authenticate, deleteUserAccount);

export default router;
