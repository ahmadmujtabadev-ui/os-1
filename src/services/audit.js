import { AuditLog } from '../models/auditlogs.js';

export async function logAudit({ actorId, entity, entityId, action, meta, req }) {
  return AuditLog.create({
    actorId,
    entity,
    entityId,
    action,
    meta,
    ip: req?.ip,
    ua: req?.headers['user-agent'],
  });
}
