import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    credentialId: { type: mongoose.Types.ObjectId, ref: 'Credential', index: true },
    exchange: { type: String, enum: ['binance', 'bybit', 'bingx'], index: true },
    label: String,
    account: String,
    scope: { type: String, enum: ['read', 'trade'], default: 'read', index: true },
    status: { type: String, enum: ['connected', 'verifying', 'failed', 'paused'], default: 'verifying', index: true },
    lastSyncAt: Date,
    lastError: String,
  },
  { timestamps: true }
);

export const Connection = mongoose.model('Connection', connectionSchema);
