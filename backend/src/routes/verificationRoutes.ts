import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as verificationController from '../controllers/verificationController.js';

const router = Router();

// Email verification
router.post('/send-email-code', authenticate, verificationController.sendEmailVerificationCode);
router.post('/verify-email', authenticate, verificationController.verifyEmail);

// Phone verification
router.post('/send-phone-code', authenticate, verificationController.sendPhoneVerificationCode);
router.post('/verify-phone', authenticate, verificationController.verifyPhone);

export default router;
