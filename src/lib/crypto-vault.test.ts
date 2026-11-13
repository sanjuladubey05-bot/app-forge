import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptSecretWithKey, decryptSecretWithKey } from './crypto-vault';

test('AES-256-GCM vault encrypts and decrypts secrets round-trip', () => {
  const secretKey = 'unit-test-master-encryption-secret-32chars';
  const plaintext = 'vcp_test_token_1234567890';
  const encrypted = encryptSecretWithKey(plaintext, secretKey);
  assert.notEqual(encrypted, plaintext);
  assert.equal(encrypted.split('.').length, 3);
  assert.equal(decryptSecretWithKey(encrypted, secretKey), plaintext);
});

test('AES-256-GCM vault rejects wrong key or malformed payload', () => {
  const encrypted = encryptSecretWithKey('secret-token', 'correct-key-1234567890123456');
  assert.throws(() => decryptSecretWithKey(encrypted, 'wrong-key-123456789012345678'));
  assert.throws(() => decryptSecretWithKey('not-valid', 'correct-key-1234567890123456'));
});
