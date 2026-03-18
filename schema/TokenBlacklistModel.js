import mongoose from 'mongoose'

const tokenBlacklistSchema = new mongoose.Schema({
  token:     { type: String, required: true },
  expiresAt: { type: Date,   required: true },
})
// ← Auto delete document when expiresAt passes
// MongoDB TTL index — cleans itself automatically!
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);