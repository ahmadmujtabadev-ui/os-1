import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';

const keyHex = process.env.MASTER_KEY_HEX || '';
if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
  throw new Error('MASTER_KEY_HEX must be 64 hex chars (32 bytes) for AES-256-GCM');
}
export const MASTER_KEY = Buffer.from(keyHex, 'hex');

// example helpers
export function encryptSecret(plaintext) {
  const iv = randomBytes(12); // GCM: 96-bit IV
  const cipher = createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptSecret(payloadB64) {
  const buf = Buffer.from(payloadB64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}
