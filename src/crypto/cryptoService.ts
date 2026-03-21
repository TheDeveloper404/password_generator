/**
 * Core cryptographic service using Web Crypto API.
 * Zero-knowledge: all encryption/decryption happens client-side.
 *
 * Encryption: AES-256-GCM (authenticated encryption)
 * Key Derivation: PBKDF2-SHA256 (600k iterations)
 *
 * SECURITY: No custom crypto. Only Web Crypto API primitives.
 */

import {
  AES_ALGORITHM,
  AES_KEY_LENGTH,
  IV_LENGTH,
  PBKDF2_ALGORITHM,
  PBKDF2_HASH,
  PBKDF2_ITERATIONS,
  SALT_LENGTH,
} from './constants';

/** Generate cryptographically secure random bytes */
export function generateRandomBytes(length: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(length);
  const view = new Uint8Array(buf);
  crypto.getRandomValues(view);
  return view;
}

/** Generate a new random salt for key derivation */
export function generateSalt(): Uint8Array<ArrayBuffer> {
  return generateRandomBytes(SALT_LENGTH);
}

/** Generate a new random IV for AES-GCM */
export function generateIV(): Uint8Array<ArrayBuffer> {
  return generateRandomBytes(IV_LENGTH);
}

/**
 * Derive an AES-256-GCM key from a master password using PBKDF2.
 *
 * @param masterPassword - The user's master password (plaintext)
 * @param salt - Unique per-vault salt
 * @param iterations - PBKDF2 iteration count (default: 600k)
 * @returns CryptoKey suitable for AES-GCM encrypt/decrypt
 */
export async function deriveKey(
  masterPassword: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    PBKDF2_ALGORITHM,
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: PBKDF2_ALGORITHM,
      salt,
      iterations,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Derive raw key bytes for creating a verifier hash.
 * Uses a separate derivation path from the encryption key.
 */
export async function deriveVerifierHash(
  masterPassword: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    PBKDF2_ALGORITHM,
    false,
    ['deriveBits'],
  );

  return crypto.subtle.deriveBits(
    {
      name: PBKDF2_ALGORITHM,
      salt,
      iterations,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    256,
  );
}

/**
 * Encrypt plaintext data using AES-256-GCM.
 *
 * @param data - The plaintext string to encrypt
 * @param key - AES-256-GCM CryptoKey
 * @returns Object containing ciphertext and IV
 */
export async function encrypt(
  data: string,
  key: CryptoKey,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array<ArrayBuffer> }> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv },
    key,
    encoded,
  );

  return { ciphertext, iv };
}

/**
 * Decrypt AES-256-GCM ciphertext back to plaintext.
 *
 * @param ciphertext - The encrypted data
 * @param key - AES-256-GCM CryptoKey (same key used for encryption)
 * @param iv - The IV used during encryption
 * @returns Decrypted plaintext string
 * @throws If decryption fails (wrong key or tampered data)
 */
export async function decrypt(
  ciphertext: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv },
    key,
    ciphertext,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Constant-time comparison of two ArrayBuffers.
 * Prevents timing attacks on verifier hash comparison.
 */
export function constantTimeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  const viewA = new Uint8Array(a);
  const viewB = new Uint8Array(b);
  let result = 0;

  for (let i = 0; i < viewA.length; i++) {
    result |= viewA[i] ^ viewB[i];
  }

  return result === 0;
}

/** Convert ArrayBuffer to base64 string for storage/export */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Convert base64 string back to ArrayBuffer */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Convert Uint8Array to base64 string */
export function uint8ArrayToBase64(array: Uint8Array<ArrayBuffer>): string {
  return arrayBufferToBase64(array.buffer);
}

/** Convert base64 string to Uint8Array */
export function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const ab = base64ToArrayBuffer(base64);
  return new Uint8Array(ab);
}
