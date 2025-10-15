import express from 'express';
import { authRequired } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { schemas } from '../validations/credientials.js';
import {
  createCredential,
  listCredentials,
  rotateCredential,
  revokeCredential,
  deleteCredential
} from '../controllers/credientials.js';

const router = express.Router();

router.get('/', authRequired, validate(schemas.list), listCredentials);
router.post('/save', authRequired, validate(schemas.create), createCredential);
router.post('/:id/rotate', authRequired, validate(schemas.action), rotateCredential);
router.post('/:id/revoke', authRequired, validate(schemas.action), revokeCredential);

router.delete('/:id', authRequired, validate(schemas.action), deleteCredential); // ⬅️ add


export default router;
