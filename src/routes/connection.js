import express from 'express';
import { authRequired } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { schemas } from '../validations/connections.js';
import {
  createConnection,
  listConnections,
  pauseConnection,
  resumeConnection,
  removeConnection,
  syncNow,
   getStats, // <-- add this
} from '../controllers/connection.js';

const router = express.Router();

router.get('/stats', authRequired, getStats);

router.get('/', authRequired, validate(schemas.list), listConnections);
router.post('/', authRequired, validate(schemas.create), createConnection);
router.post('/:id/pause', authRequired, validate(schemas.idParam), pauseConnection);
router.post('/:id/resume', authRequired, validate(schemas.idParam), resumeConnection);
router.post('/:id/sync', authRequired, validate(schemas.idParam), syncNow);
router.delete('/:id', authRequired, validate(schemas.idParam), removeConnection);

export default router;
