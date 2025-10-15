// src/routes/user.js
import express from 'express';
import { authRequired } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { schemas } from '../validations/user.js';
import {
  register, login, refresh, me,
  forgotPassword, resetPassword, changePassword, toggle2FA
} from '../controllers/user.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);

router.post('/login', validate(schemas.login), login);

router.post('/refresh', validate(schemas.refresh), refresh);

router.get('/me', authRequired, me);
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), resetPassword);
router.post('/change-password', authRequired, validate(schemas.changePassword), changePassword);
router.post('/toggle-2fa', authRequired, toggle2FA); 

export default router;
