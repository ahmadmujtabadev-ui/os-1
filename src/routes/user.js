
import express from 'express';
import {
    register,
    verifySignupOtp,
    login,
    verifyLoginOtp,
    refresh,
} from '../controllers/user.js';
import { schemas } from '../validations/user.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/verify-signup', validate(schemas.verifySignupOtp), verifySignupOtp);
router.post('/login', validate(schemas.login), login);
router.post('/verify-login', validate(schemas.verifyLoginOtp), verifyLoginOtp);
router.post('/refresh', validate(schemas.refresh), refresh);

export default router;