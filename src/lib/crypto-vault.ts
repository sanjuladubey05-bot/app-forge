import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const KEY_FILE = path.resolve(process.cwd(), '.appforge-vault.key');

function deriveAesKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

function getMasterSecret(): string {
  const fromEnv = process.env.APP_ENCRYPTION_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 16) {
    return fromEnv;
  }
  try {
    if (fs.existsSync(KEY_FILE)) {
      const existing = fs.readFileSync(KEY_FILE, 'utf-8').trim();
      if (existing.length >= 32) return existing;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(KEY_FILE, generated, { mode: 0o600, encoding: 'utf-8' });
    return generated;
  } catch {
    // Ephemeral fallback if filesystem is read-only
    return crypto.randomBytes(32).toString('hex');
  }
}

export function encryptSecretWithKey(plaintext: string, secretKey: string): string {
  const key = deriveAesKey(secretKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecretWithKey(payload: string, secretKey: string): string {
  const parts = (payload || '').split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted vault payload');
  }
  const [ivB64, tagB64, cipherB64] = parts;
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const ciphertext = Buffer.from(cipherB64, 'base64url');
  const key = deriveAesKey(secretKey);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptSecret(plaintext: string): string {
  return encryptSecretWithKey(plaintext, getMasterSecret());
}

export function decryptSecret(payload: string): string {
  return decryptSecretWithKey(payload, getMasterSecret());
}
