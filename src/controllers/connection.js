import asyncHandler from '../middleware/asyncHandler.js';
import { ok, created } from '../utils/http.js';
import {
  createConnectionService,
  listConnectionService,
  pauseConnectionService,
  resumeConnectionService,
  removeConnectionService,
  syncNowService,
} from '../services/connection.js';

export const createConnection = asyncHandler(async (req, res) => {
  const data = await createConnectionService(req, req.body);
  return created(res, data, 'Connection created');
});

export const listConnections = asyncHandler(async (req, res) => {
  const data = await listConnectionService(req, req.query);
  return ok(res, data, 'Connections fetched');
});

export const pauseConnection = asyncHandler(async (req, res) => {
  const data = await pauseConnectionService(req, req.params.id);
  return ok(res, data, 'Connection paused');
});

export const resumeConnection = asyncHandler(async (req, res) => {
  const data = await resumeConnectionService(req, req.params.id);
  return ok(res, data, 'Connection resumed');
});

export const removeConnection = asyncHandler(async (req, res) => {
  const data = await removeConnectionService(req, req.params.id);
  return ok(res, data, 'Connection removed');
});

export const syncNow = asyncHandler(async (req, res) => {
  const data = await syncNowService(req, req.params.id);
  return ok(res, data, 'Sync triggered');
});
