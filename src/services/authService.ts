/**
 * Authentication service for master password management.
 * Zero-knowledge: the master password is NEVER stored.
 * Only a verifier hash (derived via PBKDF2) is persisted for validation.
 */

import {
  deriveKey,
  deriveVerifierHash,
  generateSalt,
  constantTimeEqual,
} from '../crypto/cryptoService';
import {
  PBKDF2_ITERATIONS,
  MAX_UNLOCK_ATTEMPTS,
  LOCKOUT_DURATION_MS,
} from '../crypto/constants';
import {
  saveAuthData,
  loadAuthData,
  isVaultSetUp,
  saveEncryptedVault,
  loadEncryptedVault,
} from '../db/indexedDB';
import { encrypt, decrypt } from '../crypto/cryptoService';
import type { AuthData, VaultData, EncryptedVault } from '../types/vault';

// ─── Brute-Force Protection (in-memory) ──────────────────────────────

let failedAttempts = 0;
let lockoutUntil = 0;

export function getFailedAttempts(): number {
  return failedAttempts;
}

export function isLockedOut(): boolean {
  if (lockoutUntil > 0 && Date.now() < lockoutUntil) {
    return true;
  }
  if (lockoutUntil > 0 && Date.now() >= lockoutUntil) {
    lockoutUntil = 0;
    failedAttempts = 0;
  }
  return false;
}

export function getRemainingLockoutMs(): number {
  if (!isLockedOut()) return 0;
  return Math.max(0, lockoutUntil - Date.now());
}

function recordFailedAttempt(): void {
  failedAttempts++;
  if (failedAttempts >= MAX_UNLOCK_ATTEMPTS) {
    lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
}

function resetAttempts(): void {
  failedAttempts = 0;
  lockoutUntil = 0;
}

// ─── Auth Setup ──────────────────────────────────────────────────────

/**
 * Set up the master password for the first time.
 * Creates verifier hash + salt, and an empty encrypted vault.
 */
export async function setupMasterPassword(
  masterPassword: string,
): Promise<{ salt: Uint8Array<ArrayBuffer> }> {
  // Generate unique salt for this user
  const salt = generateSalt();

  // Derive verifier hash (NOT the encryption key — separate derivation path)
  // We use a different salt suffix to ensure verifier ≠ encryption key
  const verifierSalt = new Uint8Array(salt.length) as Uint8Array<ArrayBuffer>;
  verifierSalt.set(salt);
  // XOR the last byte to create a distinct salt for verifier
  verifierSalt[verifierSalt.length - 1] ^= 0x01;

  const verifierHash = await deriveVerifierHash(masterPassword, verifierSalt, PBKDF2_ITERATIONS);

  // Save auth data
  const authData: AuthData = {
    verifierHash,
    salt,
    iterations: PBKDF2_ITERATIONS,
    createdAt: Date.now(),
  };
  await saveAuthData(authData);

  // Create and save empty encrypted vault
  const emptyVault: VaultData = {
    version: 1,
    entries: [],
    folders: ['General'],
    lastModified: Date.now(),
  };

  const key = await deriveKey(masterPassword, salt, PBKDF2_ITERATIONS);
  const plaintext = JSON.stringify(emptyVault);
  const { ciphertext, iv } = await encrypt(plaintext, key);

  const encryptedVault: EncryptedVault = {
    id: 'primary',
    ciphertext,
    iv,
    salt,
    version: 1,
    timestamp: Date.now(),
  };
  await saveEncryptedVault(encryptedVault);

  return { salt };
}

/**
 * Verify a master password against the stored verifier hash.
 * Returns the decrypted vault data on success, null on failure.
 */
export async function verifyAndUnlock(
  masterPassword: string,
): Promise<{ vault: VaultData; salt: Uint8Array<ArrayBuffer> } | null> {
  if (isLockedOut()) {
    return null;
  }

  const authData = await loadAuthData();
  if (!authData) {
    return null;
  }

  // Derive verifier with the same salt transformation
  const verifierSalt = new Uint8Array(authData.salt.length) as Uint8Array<ArrayBuffer>;
  verifierSalt.set(authData.salt);
  verifierSalt[verifierSalt.length - 1] ^= 0x01;

  const candidateHash = await deriveVerifierHash(
    masterPassword,
    verifierSalt,
    authData.iterations,
  );

  // Constant-time comparison
  if (!constantTimeEqual(candidateHash, authData.verifierHash)) {
    recordFailedAttempt();
    return null;
  }

  // Password verified — now decrypt vault
  resetAttempts();

  const encrypted = await loadEncryptedVault();
  if (!encrypted) {
    return null;
  }

  try {
    const key = await deriveKey(masterPassword, authData.salt, authData.iterations);
    const plaintext = await decrypt(encrypted.ciphertext, key, encrypted.iv);
    const vault = JSON.parse(plaintext) as VaultData;
    return { vault, salt: authData.salt };
  } catch {
    // Decryption failed — this shouldn't happen if verifier passed
    return null;
  }
}

/**
 * Change the master password.
 * Re-encrypts the entire vault with a new key derived from the new password.
 */
export async function changeMasterPassword(
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  const result = await verifyAndUnlock(currentPassword);
  if (!result) {
    return false;
  }

  const { vault } = result;
  const newSalt = generateSalt();

  // Create new verifier
  const verifierSalt = new Uint8Array(newSalt.length) as Uint8Array<ArrayBuffer>;
  verifierSalt.set(newSalt);
  verifierSalt[verifierSalt.length - 1] ^= 0x01;

  const verifierHash = await deriveVerifierHash(newPassword, verifierSalt, PBKDF2_ITERATIONS);

  await saveAuthData({
    verifierHash,
    salt: newSalt,
    iterations: PBKDF2_ITERATIONS,
    createdAt: Date.now(),
  });

  // Re-encrypt vault with new key
  const key = await deriveKey(newPassword, newSalt, PBKDF2_ITERATIONS);
  const plaintext = JSON.stringify(vault);
  const { ciphertext, iv } = await encrypt(plaintext, key);

  await saveEncryptedVault({
    id: 'primary',
    ciphertext,
    iv,
    salt: newSalt,
    version: vault.version,
    timestamp: Date.now(),
  });

  return true;
}

/** Check if vault has been set up */
export { isVaultSetUp };
