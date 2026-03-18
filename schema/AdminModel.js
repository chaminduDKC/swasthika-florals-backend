import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  email: {
    type:     String,
    required: true,
    unique:   true,
    lowercase: true,  // ← always store as lowercase
    trim:     true,
  },
  password: {
    type:     String,
    required: true,
    select:   false,  // ← never returned in queries by default
    minlength: 8,
  },

  // ── Login security ──
  loginAttempts: { type: Number,  default: 0 },
  lockUntil:     { type: Date,    default: null },

  // ── Refresh token ──
  refreshTokenHash: { type: String, default: null, select: false },

  // ── OTP reset ──
  resetOtpHash:   { type: String, default: null, select: false },
  resetOtpExpiry: { type: Date,   default: null },

  // ── Reset token (after OTP verified) ──
  resetTokenHash:   { type: String, default: null, select: false },
  resetTokenExpiry: { type: Date,   default: null },

}, { timestamps: true })

adminSchema.pre('save', async function (){
  console.log("Save method run")
  if(!this.isModified('password')) return // hash if changed
  this.password = await bcrypt.hash(this.password, 12);
})

adminSchema.methods.comparePassword = async function(entered){
  return bcrypt.compare(entered, this.password)
}
adminSchema.methods.isLocked = function (){
  return this.lockUntil && this.lockUntil > Date.now()
}

export default mongoose.model('Admin', adminSchema)
