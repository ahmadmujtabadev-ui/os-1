import asyncHandler from '../middleware/asyncHandler.js';
import { ok, created } from '../utils/http.js';
import {
  registerService,
  verifySignupOtpService,
  loginService,
  refreshService,
  deleteAccountService,
  verifyLoginOtpService,
} from '../services/user.js';

export const register = asyncHandler(async (req, res) => {
  const data = await registerService(req.body);
  return created(res, data, data.message);
});

export const verifySignupOtp = asyncHandler(async (req, res) => {
  const data = await verifySignupOtpService(req.body);
  return ok(res, data, 'Email verified');
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginService(req, req.body);
  return ok(res, data, 'Login processed');
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const data = await verifyLoginOtpService(req, req.body);
  return ok(res, data, '2FA verified');
});

export const refresh = asyncHandler(async (req, res) => {
  const data = await refreshService(req.body);
  return ok(res, data, 'Token refreshed');
});


export const deleteAccount = asyncHandler(async (req, res) => {
  const data = await deleteAccountService(req.userId || req.user?.id || req.user?._id, req.body);
  return ok(res, data, data.message);
});