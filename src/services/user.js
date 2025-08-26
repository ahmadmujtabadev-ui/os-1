import crypto from 'crypto';
import User from '../models/user.js';
import generateOtp from '../utils/otp.js';
import { signTokens, verifyRefresh } from '../utils/jwt.js';
import extractClientInfo from '../utils/auth.js';
import sendOtpEmail from '../utils/send-otp-email.js';
import AppError from '../utils/appError.js';

export const toPublicUser = (u) => ({
  id: u._id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  businessName: u.businessName,
  role: u.role,
  emailVerified: u.emailVerified,
  twoFactorEnabled: u.twoFactorEnabled,
  apiKeyLast4: u.apiKeyLast4,
  subscription: u.subscription,
  profile: u.profile,
  settings: u.settings,
  lastLoginAt: u.lastLoginAt,
});

export async function registerService({ email, password, businessName, country, phone, role }) {
  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 409);

  const user = await User.create({ email, password, businessName, country, phone, role });

  const otp = generateOtp();
  await user.setOtp({ code: otp, purpose: 'signup' });
  await user.save();

  await sendOtpEmail({ to: email, subject: 'Verify your email', otp, purpose: 'signup' });
  return { message: 'Signup successful. Please verify OTP sent to email.' };
}

export async function verifySignupOtpService({ email, otp }) {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User not found', 404);

  const ok = await user.verifyOtp(otp);
  if (!ok) throw new AppError('Invalid or expired OTP', 400);

  user.emailVerified = true;
  await user.save();

  const tokens = signTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function loginService(req, { email, password }) {
  const { ip, userAgent } = extractClientInfo(req);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    // avoid account enumeration; identical message for both cases
    throw new AppError('Invalid credentials', 401);
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    await User.updateOne(
      { _id: user._id },
      { $push: { loginHistory: { ip, userAgent, status: 'failure' } } }
    );
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.emailVerified) {
    const otp = generateOtp();
    await user.setOtp({ code: otp, purpose: 'signup' });
    await user.save();
    await sendOtpEmail({ to: user.email, subject: 'Verify your email', otp, purpose: 'signup' });
    return { emailVerified: false, message: 'Please verify your email. OTP resent.' };
  }

  if (user.twoFactorEnabled) {
    const otp = generateOtp();
    await user.setOtp({ code: otp, purpose: 'login' });
    await user.save();
    await sendOtpEmail({ to: user.email, subject: 'Your login code', otp, purpose: 'login' });
    return { emailVerified: true, message: '2FA enabled. OTP sent to your email.' };
  }

  user.lastLoginAt = new Date();
  user.loginHistory.push({ ip, userAgent, status: 'success' });
  await user.save();

  const tokens = signTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function verifyLoginOtpService(req, { email, otp }) {
  const { ip, userAgent } = extractClientInfo(req);
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User not found', 404);

  const ok = await user.verifyOtp(otp);
  if (!ok) throw new AppError('Invalid or expired OTP', 400);

  user.lastLoginAt = new Date();
  user.loginHistory.push({ ip, userAgent, status: 'success' });
  await user.save();

  const tokens = signTokens(user);
  return { user: toPublicUser(user), ...tokens };
}

export async function toggle2FAService(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.twoFactorEnabled = !user.twoFactorEnabled;
  await user.save();
  return { twoFactorEnabled: user.twoFactorEnabled };
}

export async function forgotPasswordService({ email }) {
  const user = await User.findOne({ email });
  if (user) {
    const otp = generateOtp();
    await user.setOtp({ code: otp, purpose: 'forgot' });
    await user.save();
    await sendOtpEmail({ to: email, subject: 'Password reset code', otp, purpose: 'forgot' });
  }
  // Always respond the same to avoid enumeration
  return { message: 'If the email exists, an OTP has been sent.' };
}

export async function resetPasswordService({ email, newPassword }) {
  const user = await User.findOne({ email }).select('+passwordHistory');
  if (!user) throw new AppError('User not found', 404);
  user.password = newPassword;
  await user.save();
  return { message: 'Password updated. You can now log in.' };
}

export async function requestChangePasswordOtpService(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const otp = generateOtp();
  await user.setOtp({ code: otp, purpose: 'change_password' });
  await user.save();
  await sendOtpEmail({ to: user.email, subject: 'Confirm password change', otp, purpose: 'change_password' });
  return { message: 'OTP sent to your email.' };
}

export async function changePasswordService(userId, { oldPassword, newPassword }) {
  const user = await User.findById(userId).select('+password +passwordHistory');
  if (!user) throw new AppError('User not found', 404);

  const ok = await user.comparePassword(oldPassword);
  if (!ok) throw new AppError('Old password incorrect', 400);

  user.password = newPassword;
  await user.save();
  return { message: 'Password changed successfully.' };
}

export async function refreshService({ refreshToken }) {
  try {
    const payload = verifyRefresh(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw new AppError('Invalid token', 401);
    const tokens = signTokens(user);
    return tokens;
  } catch (e) {
    throw new AppError('Invalid token', 401);
  }
}

export async function meService(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return { user: toPublicUser(user) };
}

export async function generateApiKeyService(userId) {
  const user = await User.findById(userId).select('+apiKeyHash');
  if (!user) throw new AppError('User not found', 404);
  const rawKey = 'ck_' + crypto.randomBytes(24).toString('hex');
  await user.setApiKey(rawKey);
  await user.save();
  return { apiKey: rawKey, last4: rawKey.slice(-4) };
}

export async function revokeApiKeyService(userId) {
  const user = await User.findById(userId).select('+apiKeyHash');
  if (!user) throw new AppError('User not found', 404);
  user.apiKeyHash = undefined;
  user.apiKeyLast4 = undefined;
  await user.save();
  return { message: 'API key revoked.' };
}

export async function changeProfileService(userId, body) {
  if (!userId) throw new AppError('Unauthorized', 401);

  const {
    userName, // not used now, keep for future split logic
    firstName,
    lastName,
    phone,
    address,
    country,
    storeName
  } = body || {};

  const update = {};
  if (firstName?.trim()) update.firstName = firstName.trim();
  if (lastName?.trim())  update.lastName  = lastName.trim();
  if (typeof storeName === 'string') update.businessName = storeName.trim();

  if (typeof phone   === 'string') update['profile.phone']   = phone.trim();
  if (typeof address === 'string') update['profile.address'] = address.trim();
  if (typeof country === 'string') update['profile.country'] = country.trim();

  // guardrails (no-op if present)
  ['email','role','apiKey','subscription','settings'].forEach((k)=> delete update[k]);

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true, select: '-password -passwordHistory -loginHistory -apiKey' }
  );

  if (!user) throw new AppError('User not found', 404);

  return { message: 'Profile updated', user };
}

export async function deleteAccountService(userId, { hard = false } = {}) {
  if (!userId) throw new AppError('Unauthorized', 401);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (hard === true) {
    await User.deleteOne({ _id: userId });
    return { message: 'Account permanently deleted' };
  }

  user.isActive = false;
  user.isDeleted = true;
  user.deletedAt = new Date();

  const ts = Date.now();
  user.email = `deleted+${user._id}.${ts}@example.invalid`;
  user.firstName = 'Deleted';
  user.lastName = 'User';
  user.businessName = undefined;

  await user.save();

  return { message: 'Account deleted' };
}