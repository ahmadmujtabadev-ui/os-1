import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    entity: { type: String, enum: ['credential', 'connection', 'user'], index: true },
    entityId: { type: mongoose.Types.ObjectId, index: true },
    action: String, // created, updated, revoked, rotated, synced, error, etc.
    meta: Object,
    ip: String,
    ua: String,
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditSchema);
