import crypto from 'crypto';

const KEY = Buffer.from("9f5c1a8d3e72b4c0");

export function encryptSecret(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64'); 
}

export function decryptSecret(blobB64) {
  const blob = Buffer.from(blobB64, 'base64');
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const enc = blob.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  return dec;
}

export function fingerprint(input) {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  // show a short fingerprint like "73:af:1b"
  return `${hash.slice(0,2)}:${hash.slice(2,4)}:${hash.slice(4,6)}`;
}

export function maskKeyLast4(key) {
  const last4 = key.slice(-4);
  return { last4, masked: `••••-••••-••••-${last4}` };
}
