import { rateLimit } from 'express-rate-limit'

export const limiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message:        { message },
  standardHeaders: true,
  legacyHeaders:   false,
})

// Pre-defined common ones
export const loginLimiter  = limiter(1 * 60 * 1000, 6,  'Too many login attempts. Try again in 15 minutes.')
export const otpLimiter    = limiter(1 * 60 * 1000, 3,  'Too many OTP requests. Try again in 1 hour.')
export const verifyLimiter = limiter(1 * 60 * 1000, 5,  'Too many attempts. Try again in 15 minutes.')