// src/models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const loginHistorySchema = new mongoose.Schema(
  {
    ip: String,
    userAgent: String,
    status: { type: String, enum: ['success', 'failure'] },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    password: { type: String, select: false, minlength: 8, required: true },

    firstName: String,
    lastName: String,
    businessName: String,
    country: String,
    phone: String,

    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: true }, 
    twoFactorEnabled: { type: Boolean, default: false }, 

    apiKeyLast4: String, 
    subscription: Object,
    profile: Object,
    settings: Object,
    lastLoginAt: Date,
    loginHistory: [loginHistorySchema],

    // Password reset token (no OTP)
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// create a password reset token (returns raw token to send via email)
userSchema.methods.createPasswordResetToken = function () {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  this.passwordResetTokenHash = hash;
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  return raw;
};

const User = mongoose.model('User', userSchema);
export default User;
