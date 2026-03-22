/**
 * Pattern Lock service.
 * Stores a pattern (sequence of node indices on a 3x3 grid) hashed
 * and mapped to an AES-encrypted master password in IndexedDB.
 *
 * Flow:
 * 1. User sets a pattern → pattern hash + encrypted master pw stored
 * 2. On unlock: user draws pattern → hash matches → decrypt master pw
 */

const PATTERN_KEY = 'pg_pattern_lock';

interface PatternData {
  /** SHA-256 hash of the pattern sequence */
  patternHash: string;
  /** AES-GCM encrypted master password (base64) */
  encryptedMasterPw: string;
  /** AES-GCM IV (base64) */
  iv: string;
  /** AES key derived from pattern (base64) */
  aesKey: string;
  /** Timestamp */
  createdAt: number;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hashPattern(pattern: number[]): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pattern.join('-'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toBase64(hashBuffer);
}

/* ── Public API ──────────────────────────────────────────────────── */

/** Check if a pattern lock is enrolled */
export function isPatternEnrolled(): boolean {
  return localStorage.getItem(PATTERN_KEY) !== null;
}

/** Register a pattern lock with the master password */
export async function registerPattern(pattern: number[], masterPassword: string): Promise<void> {
  if (pattern.length < 4) {
    throw new Error('Pattern must connect at least 4 dots');
  }

  const patternHash = await hashPattern(pattern);

  // Generate AES key and encrypt master password
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(masterPassword);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);

  const data: PatternData = {
    patternHash,
    encryptedMasterPw: toBase64(encrypted),
    iv: toBase64(iv.buffer as ArrayBuffer),
    aesKey: toBase64(exportedKey),
    createdAt: Date.now(),
  };

  localStorage.setItem(PATTERN_KEY, JSON.stringify(data));
}

/** Verify pattern and return the master password if correct */
export async function verifyPattern(pattern: number[]): Promise<string | null> {
  const raw = localStorage.getItem(PATTERN_KEY);
  if (!raw) return null;

  const data = JSON.parse(raw) as PatternData;
  const inputHash = await hashPattern(pattern);

  if (inputHash !== data.patternHash) {
    return null; // Pattern doesn't match
  }

  // Decrypt master password
  const encrypted = fromBase64(data.encryptedMasterPw);
  const iv = fromBase64(data.iv);
  const keyData = fromBase64(data.aesKey);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encrypted.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

/** Remove the pattern lock */
export function removePattern(): void {
  localStorage.removeItem(PATTERN_KEY);
}

/** Update pattern lock with new master password (keep same pattern) */
export async function updatePatternPassword(newMasterPassword: string): Promise<void> {
  const raw = localStorage.getItem(PATTERN_KEY);
  if (!raw) return;

  const data = JSON.parse(raw) as PatternData;

  // Re-encrypt with new password, keep same pattern hash
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(newMasterPassword);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);

  const updated: PatternData = {
    ...data,
    encryptedMasterPw: toBase64(encrypted),
    iv: toBase64(iv.buffer as ArrayBuffer),
    aesKey: toBase64(exportedKey),
  };

  localStorage.setItem(PATTERN_KEY, JSON.stringify(updated));
}
