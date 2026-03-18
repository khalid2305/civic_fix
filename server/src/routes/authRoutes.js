import express from 'express';
import { register, login, googleLogin, sendOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/otp-send', sendOtp);
router.post('/otp-verify', verifyOtp);

export default router;
