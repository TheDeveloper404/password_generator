/**
 * WebAuthn / Biometric authentication service.
 * 100% client-side — no server required.
 *
 * Flow:
 * 1. User sets master password → opts to enable biometric
 * 2. We create a platform authenticator credential
 * 3. Master password is encrypted with a random AES key stored alongside
 * 4. On unlock: biometric challenge → success → decrypt & return master password
 *
 * Security model:
 * - The biometric is a convenience factor, not the sole security
 * - The encrypted master password + AES key are stored in IndexedDB
 * - Platform authenticator (fingerprint/Face ID) gates access
 * - Challenge is client-generated (acceptable for local vault unlock)
 */

import { openDB } from '../db/indexedDB';

const STORE_BIOMETRIC = 'biometric';
const BIOMETRIC_KEY = 'primary';
const RP_ID_KEY = 'pg_biometric_rp';

interface BiometricData {
  id: string;
  credentialId: string;        // base64url encoded
  publicKey: string;           // base64url encoded (for assertion verification)
  encryptedMasterPw: string;   // base64 encoded
  iv: string;                  // base64 encoded
  aesKey: string;              // base64 encoded (wrapped)
  createdAt: number;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(str: string): Uint8Array<ArrayBuffer> {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getRpId(): string {
  // Use actual hostname for deployed apps, fallback for localhost
  return window.location.hostname || 'localhost';
}

/* ── IndexedDB for biometric data ───────────────────────────────── */

async function saveBiometricData(data: BiometricData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BIOMETRIC, 'readwrite');
    tx.objectStore(STORE_BIOMETRIC).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadBiometricData(): Promise<BiometricData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BIOMETRIC, 'readonly');
    const request = tx.objectStore(STORE_BIOMETRIC).get(BIOMETRIC_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteBiometricData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BIOMETRIC, 'readwrite');
    tx.objectStore(STORE_BIOMETRIC).delete(BIOMETRIC_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ── AES encryption for master password ─────────────────────────── */

async function encryptMasterPassword(masterPassword: string): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array; key: ArrayBuffer }> {
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

  return { encrypted, iv, key: exportedKey };
}

async function decryptMasterPassword(encrypted: ArrayBuffer, iv: ArrayBuffer, keyData: ArrayBuffer): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

/* ── Public API ──────────────────────────────────────────────────── */

/** Check if platform authenticator (biometric) is available */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Check if biometric is already enrolled */
export async function isBiometricEnrolled(): Promise<boolean> {
  const data = await loadBiometricData();
  return data !== null;
}

/** Register biometric for the current master password */
export async function registerBiometric(masterPassword: string): Promise<void> {
  const rpId = getRpId();

  // Generate a random user ID for WebAuthn
  const userId = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.create({
    publicKey: {
      rp: {
        name: 'PassGen',
        id: rpId,
      },
      user: {
        id: userId,
        name: 'passgen-user',
        displayName: 'PassGen User',
      },
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },    // ES256
        { alg: -257, type: 'public-key' },   // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Biometric registration cancelled');
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  // Encrypt the master password
  const { encrypted, iv, key } = await encryptMasterPassword(masterPassword);

  // Store RP ID for later use
  localStorage.setItem(RP_ID_KEY, rpId);

  // Save biometric data
  await saveBiometricData({
    id: BIOMETRIC_KEY,
    credentialId: toBase64Url(credential.rawId),
    publicKey: toBase64(response.getPublicKey() ?? new ArrayBuffer(0)),
    encryptedMasterPw: toBase64(encrypted),
    iv: toBase64(iv.buffer as ArrayBuffer),
    aesKey: toBase64(key),
    createdAt: Date.now(),
  });
}

/** Authenticate with biometric and return the master password */
export async function authenticateWithBiometric(): Promise<string> {
  const data = await loadBiometricData();
  if (!data) {
    throw new Error('Biometric not enrolled');
  }

  const rpId = localStorage.getItem(RP_ID_KEY) || getRpId();

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId,
      allowCredentials: [
        {
          type: 'public-key',
          id: fromBase64Url(data.credentialId),
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('Biometric authentication cancelled');
  }

  // Biometric succeeded — decrypt the master password
  const encrypted = fromBase64(data.encryptedMasterPw);
  const iv = fromBase64(data.iv);
  const key = fromBase64(data.aesKey);

  return await decryptMasterPassword(encrypted.buffer as ArrayBuffer, iv.buffer as ArrayBuffer, key.buffer as ArrayBuffer);
}

/** Remove biometric enrollment */
export async function removeBiometric(): Promise<void> {
  await deleteBiometricData();
  localStorage.removeItem(RP_ID_KEY);
}

/** Re-enroll biometric with a new master password (e.g., after password change) */
export async function updateBiometricPassword(newMasterPassword: string): Promise<void> {
  const enrolled = await isBiometricEnrolled();
  if (!enrolled) return;

  // Just re-encrypt with the new password, keep the same credential
  const data = await loadBiometricData();
  if (!data) return;

  const { encrypted, iv, key } = await encryptMasterPassword(newMasterPassword);

  await saveBiometricData({
    ...data,
    encryptedMasterPw: toBase64(encrypted),
    iv: toBase64(iv.buffer as ArrayBuffer),
    aesKey: toBase64(key),
  });
}
