import express from 'express';
import userRoutes from './user.js';
import credentialRoutes from './credientials.js';
import connectionRoutes from './connection.js';

const router = express.Router();

router.use('/api/v1/users', userRoutes);
router.use('/api/v1/credentials', credentialRoutes);
router.use('/api/v1/connections', connectionRoutes);

export default router;
