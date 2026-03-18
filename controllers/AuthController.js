import jwt, { decode } from "jsonwebtoken"
import AdminModel from "../schema/AdminModel.js"
import dotenv from 'dotenv'
import TokenBlacklistModel from "../schema/TokenBlacklistModel.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto'
import { log } from "console";

dotenv.config();

const createAccessToken = (id) => jwt.sign({ id }, process.env.ACCESS_TOKEN, { expiresIn: '15m' })
const createRefreshToken = (id) => jwt.sign({ id }, process.env.REFRESH_TOKEN, { expiresIn: '7d' })

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 15 * 60 * 1000
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

export const setupAdmin = async (req, res) => {
  try {
    const { email, password, setupKey } = req.body;

    if (!email || !password || !setupKey) return res.json({ msg: "missing fields" })

    if (setupKey !== process.env.SETUP_KEY) return res.status(401).json({ msg: "invalid setup key" })

    const existingAdmin = await AdminModel.findOne();
    if (existingAdmin) return res.status(409).json({ msg: "admin already exist" })

    
    await AdminModel.create({ email, password })

    res.status(201).json({ msg: "admin created" })

  } catch (error) {
    console.error("setupAdminError: ", error)
    res.status(500).json({ msg: "internal server error", error: error })
  }
}


export const login = async (req, res) => {
  try {
    console.log("Login");
    

    const { email, password } = req.body;
    console.log(email, password);
    
    if (!email || !password) return res.status(400).json({ msg: "email and password required" })

    const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() }) .select('+password')
    if (!existingAdmin) return res.status(401).json({ msg: "invalid credentials" })

    if (existingAdmin.isLocked()) {
      console.log(existingAdmin.lockUntil);
      
      const minsLeft = Math.ceil((existingAdmin.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ msg: `account locked. try again in ${minsLeft} minutes.` })
    }
    const isMatch = await existingAdmin.comparePassword(password)
    if (!isMatch) {
      console.log("Wrong password");
      console.log(password);
      
      
      existingAdmin.loginAttempts += 1;
      if (existingAdmin.loginAttempts > 5) {
        existingAdmin.lockUntil = Date.now() + 30 * 60 * 1000;
        existingAdmin.loginAttempts = 0
      }
      console.log("No1");
      
      await existingAdmin.save()
      return res.json({msg:'invalid credentials'})
    }
    existingAdmin.loginAttempts = 0;
    existingAdmin.lockUntil = null;

    const accessToken = createAccessToken(existingAdmin._id)
    const refreshToken = createRefreshToken(existingAdmin._id)

    existingAdmin.refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    console.log("No2");
    await existingAdmin.save()

    res.cookie('sfd_access', accessToken, accessCookieOptions);
    res.cookie('sfd_refresh', refreshToken, refreshCookieOptions);

    res.status(200).json({ msg: "login success", admin: { id: existingAdmin._id, email: email } })

  } catch (error) {
    console.error('login error:', error)
    res.status(500).json({ msg: 'Server error', error:error })
  }
}

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.sfd_refresh;
    if (!refreshToken) return res.status(401).json({ msg: "empty refresh token" })

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
    } catch (error) {
      return res.status(401).json({ msg: "invalid token" })
    }

    // find admin and check refreshtoken match
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const admin = await AdminModel.findOne({
      _id: decoded.id, refreshTokenHash: tokenHash
    })
    if (!admin) return res.status(401).json({ message: 'Invalid refresh token' })

    // genberate new tokens
    const newAccessToken = createAccessToken(admin._id)
    const newRefreshToken = createRefreshToken(admin._id)

    admin.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

    admin.save()

    res.cookie('sfd_access', newAccessToken, accessCookieOptions)
    res.cookie('sfd_refresh', newRefreshToken, refreshCookieOptions)

    res.status(200).json({ msg: 'token refreshed' })

  } catch (error) {
    console.error('refresh error:', err)
    res.status(500).json({ mag: 'Server error' })
  }


}

export const logout = async (req, res) => {
  console.log("Logiut called");
  
  try {
    const token = req.cookies.sfd_access

    // Blacklist the access token so it can't be reused
    if (token) {
      console.log("Token exists", token);
      
      const decoded = jwt.decode(token)  // decode without verify (already verified by middleware)
      await TokenBlacklistModel.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),  // ← TTL auto deletes at this time
      })
    }

    // Clear refresh token from DB
    console.log("Clearing");
    
    await AdminModel.findByIdAndUpdate(req.admin._id, { refreshTokenHash: null })
    console.log("Cleared");

    // Clear both cookies
    res.clearCookie('sfd_access')
    res.clearCookie('sfd_refresh')

    res.status(200).json({ msg: 'Logged out successfully' })

  } catch (err) {
    console.error('logout error:', err)
    res.status(500).json({ msg: 'Server error' })
  }
}

export const getMe = async (req, res) => {
  res.status(200).json({ msg: "admin received", admin: { id: req.admin._id, email: req.admin.email } })
}

export const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) return res.status(401).json({ msg: "empty email" })

    const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() })
    if (!existingAdmin) return res.status(200).json({ msg: "otp has been sent to given email" })

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    existingAdmin.resetOtpHash = otpHash;
    existingAdmin.resetOtpExpiry = Date.now() + 10 * 60 * 1000;

    await existingAdmin.save()

    await sendEmail({
      to: existingAdmin.email,
      from: 'onboarding@resend.dev',
      subject: 'Your Password Reset OTP — Swasthika Floral',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>Password Reset OTP</h2>
          <p>Your one-time code is:</p>
          <div style="font-size:2.5rem;font-weight:bold;letter-spacing:12px;color:#6d28d9;margin:24px 0">
            ${otp}
          </div>
          <p>Expires in <strong>10 minutes</strong>.</p>
          <p style="color:#999;font-size:.85rem">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'If email exists, OTP has been sent' })

  } catch (error) {
    console.error('forgotPassword error:', error)
    res.status(500).json({ msg: 'Server error' })
  }
}
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const existingAdmin = await AdminModel.findOne({
      email: email.toLowerCase(),
      resetOtpHash: otpHash,
      resetOtpExpiry: { $gt: Date.now() }
    })

    if (!existingAdmin) return res.status(401).json({ msg: "invalid or expired otp" })

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');


    existingAdmin.resetTokenHash = resetTokenHash
    existingAdmin.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    existingAdmin.resetOtpHash = undefined
    existingAdmin.resetOtpExpiry = undefined

    await existingAdmin.save()
    console.log(resetToken);
    
    res.status(200).json({ resetToken })
  } catch (error) {
    console.error(`verify otp error : `, error)
    res.status(500).json({ msg: "verify otp failed" })
  }
}
export const resetPassword = async (req, res) => {
  try {

    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(401).json({ msg: 'empty fields' })

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    const existingAdmin = await AdminModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiry: { $gt: Date.now() }
    })

    if (!existingAdmin) return res.status(400).json({ msg: "invalid or expired token" })

    if (newPassword.length < 8) return res.status(400).json({ msg: "password must be at least 8 chars" })


    existingAdmin.password = newPassword
    existingAdmin.resetTokenHash = undefined
    existingAdmin.resetOtpExpiry = undefined
    existingAdmin.loginAttempts = 0
    existingAdmin.lockUntil = null
    await existingAdmin.save();

    res.status(200).json({ msg: "password reset success" })


  } catch (error) {
    console.error('resetPassword error:', err)
    res.status(500).json({ message: 'Server error' })
  }

}