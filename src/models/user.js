import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordHistoryLimit = 5;

const otpSchema = new mongoose.Schema({
  code: { type: String },            // 6-digit string (hashed at rest)
  purpose: { type: String, enum: ['signup', 'login', 'forgot', 'change_password'] },
  expiresAt: { type: Date },
}, { _id: false });

const loginEntrySchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failure'], default: 'success' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  passwordChangedAt: { type: Date },
  passwordHistory: [{ type: String, select: false }], // previous hashed passwords
  firstName: { type: String },
  lastName: { type: String },
  country: { type: String, required: true },
  phone: { type: String, required: true },

  businessName: { type: String },
  role: { type: String, enum: ['artist', 'shop_owner', 'admin'], default: 'artist' },

  emailVerified: { type: Boolean, default: false }, // required by Epic sign-up flow with OTP 
  twoFactorEnabled: { type: Boolean, default: false }, // email OTP as 2FA on login 
  pendingOtp: otpSchema,  // single active OTP at a time

  apiKeyHash: { type: String, select: false }, // store hash, not raw key
  apiKeyLast4: { type: String },               // show last 4 in UI
  isActive: { type: Boolean, default: true },

  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    expiresAt: Date
  },

  profile: {
    avatar: String,
    bio: String,
    website: String,
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String
    }
  },

  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    timezone: { type: String, default: 'UTC' }
  },

  oauth: {
    provider: { type: String, enum: [null, 'google'], default: null }, // optional Google OAuth 
    providerId: { type: String, index: true }
  },
  // Add these fields into your existing user schema
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },

  lastLoginAt: Date,
  loginHistory: [loginEntrySchema],
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(this.password, salt);

  // Prevent password reuse
  const history = (this.passwordHistory || []);
  const reused = await Promise.all(history.map(h => bcrypt.compare(this.password, h)));
  if (reused.some(Boolean)) {
    const err = new Error('You cannot reuse a previous password.');
    err.code = 'PASSWORD_REUSE';
    return next(err);
  }

  // push current hash to history, trim length
  history.unshift(hashed);
  this.passwordHistory = history.slice(0, passwordHistoryLimit);

  this.password = hashed;
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.setApiKey = async function (rawKey) {
  const salt = await bcrypt.genSalt(12);
  this.apiKeyHash = await bcrypt.hash(rawKey, salt);
  this.apiKeyLast4 = rawKey.slice(-4);
};

userSchema.methods.verifyApiKey = function (rawKey) {
  if (!this.apiKeyHash) return false;
  return bcrypt.compare(rawKey, this.apiKeyHash);
};

userSchema.methods.setOtp = async function ({ code, purpose, ttlMinutes = 10 }) {

  this.pendingOtp = {
    code: code,
    purpose,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
  };
};
userSchema.methods.verifyOtp = async function (code, purpose) {
  const otp = this.pendingOtp;
  if (!otp || !otp.expiresAt || otp.expiresAt < new Date()) return false;
  const ok = await code;
  if (ok) this.pendingOtp = undefined; // one-time use
  return ok;
};

const User = mongoose.model('User', userSchema);
export default User;