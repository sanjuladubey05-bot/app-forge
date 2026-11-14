import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptSecretWithKey, decryptSecretWithKey } from './crypto-vault';

test('encryptSecretWithKey and decryptSecretWithKey perform AES-256-GCM round-trip', () => {
  const key = 'test-master-secret-32-characters-long';
  const plaintext = 'vcp_pat_test_secret_token_987654321';
  const encrypted = encryptSecretWithKey(plaintext, key);

  assert.notEqual(encrypted, plaintext);
  assert.equal(encrypted.split('.').length, 3);
  assert.equal(decryptSecretWithKey(encrypted, key), plaintext);
});

test('decryptSecretWithKey rejects wrong keys and tampered ciphertexts', () => {
  const key = 'test-master-secret-32-characters-long';
  const wrongKey = 'different-secret-key-32-chars-long';
  const encrypted = encryptSecretWithKey('sensitive-token', key);

  assert.throws(() => decryptSecretWithKey(encrypted, wrongKey));

  const parts = encrypted.split('.');
  const tampered = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -2)}AA`;
  assert.throws(() => decryptSecretWithKey(tampered, key));
  assert.throws(() => decryptSecretWithKey('invalid-payload', key));
});
