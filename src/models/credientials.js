import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    exchange: { type: String, enum: ['binance', 'bybit', 'bingx'], index: true },
    label: String,
    apiKeyLast4: String,
    apiKeyFingerprint: String,
    secretEnc: String, // AES-GCM blob (base64)
    ownerEmail: String,
    ownerUsername: String,
    status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
    lastUsedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

export const Credential = mongoose.model('Credential', credentialSchema);
