import { Router } from "express";
import { login, getMe, forgotPassword, verifyOtp,  setupAdmin, resetPassword, logout, refresh } from "../controllers/AuthController.js";
import { loginLimiter, otpLimiter, verifyLimiter } from "../middles/rateLimiter.js";
import protect from "../middles/authMiddleware.js";

const router = Router();

// ── PUBLIC routes (no token needed) ──────────────────────
router.post('/login',                        login)
router.post('/logout',                      protect,logout)
router.post('/forgot-password',             otpLimiter, forgotPassword)
router.post('/reset-password',              resetPassword)
router.post('/setup',                       setupAdmin)   // Run ONCE to create first admin
router.post('/verify-otp',                  verifyLimiter, verifyOtp)
router.post('/refresh',  refresh)

// ── PROTECTED routes (token required) ────────────────────
// authMiddleware runs FIRST, then getMe
// If token is invalid → authMiddleware returns 401 → getMe never runs
router.get('/me',                           protect, getMe)


export default router