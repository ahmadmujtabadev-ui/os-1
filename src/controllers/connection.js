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
import { Connection } from '../models/connection.js';
import { Credential } from '../models/credientials.js';
import mongoose from 'mongoose';

export const createConnection = asyncHandler(async (req, res) => {
  const data = await createConnectionService(req, req.body);
  return created(res, data, 'Connection created');
});

export async function getStats(req, res, next) {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.sub);
    console.log("ownerId", ownerId);

    const [connTotals] = await Connection.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'connected'] }, 1, 0] } },
          verifying: { $sum: { $cond: [{ $eq: ['$status', 'verifying'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    console.log("conntotal 39", connTotals);
    
    const connectionsByExchange = await Connection.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: '$exchange',
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'connected'] }, 1, 0] } },
          verifying: { $sum: { $cond: [{ $eq: ['$status', 'verifying'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          exchange: '$_id',
          total: 1,
          active: 1,
          verifying: 1,
          failed: 1,
          paused: 1,
        },
      },
    ]);

    const [credTotals] = await Credential.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          valid: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          revoked: { $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    const credentialsByExchange = await Credential.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: '$exchange',
          total: { $sum: 1 },
          valid: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          revoked: { $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          exchange: '$_id',
          total: 1,
          valid: 1,
          revoked: 1,
        },
      },
    ]);

    res.json({
      connections: {
        total: connTotals?.total ?? 0,
        active: connTotals?.active ?? 0,
        verifying: connTotals?.verifying ?? 0,
        failed: connTotals?.failed ?? 0,
        paused: connTotals?.paused ?? 0,
        byExchange: connectionsByExchange,
      },
      credentials: {
        total: credTotals?.total ?? 0,
        valid: credTotals?.valid ?? 0,
        revoked: credTotals?.revoked ?? 0,
        byExchange: credentialsByExchange,
      },
    });
  } catch (err) {
    next(err);
  }
}

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
