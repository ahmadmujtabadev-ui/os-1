import asyncHandler from '../middleware/asyncHandler.js';
import { ok, created } from '../utils/http.js';
import {
  createCredentialService,
  listCredentialService,
  rotateCredentialService,
  revokeCredentialService,
  deleteCredentialService,
} from '../services/credientials.js';

export const deleteCredential = asyncHandler(async (req, res) => {
  const data = await deleteCredentialService(req, req.params.id);
  return ok(res, data, 'Credential deleted');
});

export const createCredential = asyncHandler(async (req, res) => {
  const data = await createCredentialService(req, req.body);
  return created(res, data, 'Credential saved');
});

export const listCredentials = asyncHandler(async (req, res) => {
  const data = await listCredentialService(req, req.query);
  return ok(res, data, 'Credentials fetched');
});

export const rotateCredential = asyncHandler(async (req, res) => {
  const data = await rotateCredentialService(req, req.params.id);
  return ok(res, data, 'Rotation requested');
});

export const revokeCredential = asyncHandler(async (req, res) => {
  const data = await revokeCredentialService(req, req.params.id);
  return ok(res, data, 'Credential revoked');
});
