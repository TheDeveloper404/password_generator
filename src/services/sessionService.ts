/**
 * Session persistence service.
 *
 * Stores the master password in sessionStorage (encrypted with a random
 * session key) so the vault can survive page refreshes without forcing the
 * user to re-enter the master password every time.
 *
 * Security properties:
 * - Data lives only in sessionStorage → wiped when the tab/browser closes
 * - An expiry timestamp is enforced so the session auto-expires
 * - A manual `clearSession()` wipes everything immediately (lock)
 * - The master password is XOR-obfuscated in storage to avoid plain-text
 */

// ─── Types ───────────────────────────────────────────────────────────

export type SessionTimeout = 0 | 5 | 15 | 30 | 60; // minutes, 0 = disabled

interface StoredSession {
  /** XOR-obfuscated master password (base64) */
  payload: string;
  /** Random one-time pad used for XOR (base64) */
  pad: string;
  /** Timestamp when session expires (epoch ms) */
  expiresAt: number;
  /** Salt stored as base64 for vault decryption */
  salt: string;
}

// ─── Constants ───────────────────────────────────────────────────────

const SESSION_KEY = 'pg_session';
const TIMEOUT_KEY = 'pg_session_timeout';

/** Available timeout options in minutes */
export const SESSION_TIMEOUT_OPTIONS: SessionTimeout[] = [0, 5, 15, 30, 60];

// ─── Helpers ─────────────────────────────────────────────────────────

function uint8ToBase64(arr: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

/** XOR-obfuscate a string with a random pad of the same length */
function xorObfuscate(text: string): { payload: Uint8Array; pad: Uint8Array } {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const pad = crypto.getRandomValues(new Uint8Array(data.length));
  const payload = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    payload[i] = data[i] ^ pad[i];
  }
  return { payload, pad };
}

/** Reverse XOR obfuscation */
function xorDeobfuscate(payload: Uint8Array, pad: Uint8Array): string {
  const data = new Uint8Array(payload.length);
  for (let i = 0; i < payload.length; i++) {
    data[i] = payload[i] ^ pad[i];
  }
  return new TextDecoder().decode(data);
}

// ─── Public API ──────────────────────────────────────────────────────

/** Get the configured session timeout in minutes (0 = disabled) */
export function getSessionTimeout(): SessionTimeout {
  try {
    const raw = localStorage.getItem(TIMEOUT_KEY);
    if (raw) {
      const val = JSON.parse(raw) as number;
      if (SESSION_TIMEOUT_OPTIONS.includes(val as SessionTimeout)) {
        return val as SessionTimeout;
      }
    }
  } catch { /* ignore */ }
  return 0; // disabled by default
}

/** Set the session timeout preference (persisted in localStorage) */
export function setSessionTimeout(minutes: SessionTimeout): void {
  localStorage.setItem(TIMEOUT_KEY, JSON.stringify(minutes));
  // If setting to 0 (disabled), clear any active session
  if (minutes === 0) {
    clearSession();
  }
}

/** Save an active session (called after successful unlock) */
export function saveSession(
  masterPassword: string,
  salt: Uint8Array,
): void {
  const timeout = getSessionTimeout();
  if (timeout === 0) return; // session persistence disabled

  const { payload, pad } = xorObfuscate(masterPassword);

  const session: StoredSession = {
    payload: uint8ToBase64(payload),
    pad: uint8ToBase64(pad),
    expiresAt: Date.now() + timeout * 60 * 1000,
    salt: uint8ToBase64(salt),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** 
 * Restore a session if one exists and hasn't expired.
 * Returns the master password + salt, or null.
 */
export function restoreSession(): { masterPassword: string; salt: Uint8Array } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as StoredSession;

    // Check expiry
    if (Date.now() >= session.expiresAt) {
      clearSession();
      return null;
    }

    const payload = base64ToUint8(session.payload);
    const pad = base64ToUint8(session.pad);
    const masterPassword = xorDeobfuscate(payload, pad);
    const salt = base64ToUint8(session.salt);

    return { masterPassword, salt };
  } catch {
    clearSession();
    return null;
  }
}

/** Clear the active session (called on lock or timeout=0) */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Refresh the session expiry (called on user activity) */
export function refreshSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;

    const timeout = getSessionTimeout();
    if (timeout === 0) {
      clearSession();
      return;
    }

    const session = JSON.parse(raw) as StoredSession;
    session.expiresAt = Date.now() + timeout * 60 * 1000;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    clearSession();
  }
}
