/**
 * IndexedDB storage layer for the password vault.
 * Stores only encrypted blobs — never plaintext.
 *
 * Database: passgen_db
 * Object Stores:
 *   - vault: Encrypted vault blobs
 *   - auth: Master password verifier data
 */

import type { AuthData, EncryptedVault } from '../types/vault';

const DB_NAME = 'passgen_db';
const DB_VERSION = 1;

const STORE_VAULT = 'vault';
const STORE_AUTH = 'auth';

const VAULT_KEY = 'primary';
const AUTH_KEY = 'primary';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_VAULT)) {
        db.createObjectStore(STORE_VAULT, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_AUTH)) {
        db.createObjectStore(STORE_AUTH, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function doTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = callback(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

// ─── Vault Operations ────────────────────────────────────────────────

/** Save the encrypted vault blob to IndexedDB */
export async function saveEncryptedVault(vault: EncryptedVault): Promise<void> {
  const record = { ...vault, id: VAULT_KEY };
  await doTransaction(STORE_VAULT, 'readwrite', (store) => store.put(record));
}

/** Load the encrypted vault blob from IndexedDB */
export async function loadEncryptedVault(): Promise<EncryptedVault | null> {
  const result = await doTransaction<EncryptedVault | undefined>(
    STORE_VAULT,
    'readonly',
    (store) => store.get(VAULT_KEY),
  );
  return result ?? null;
}

/** Delete the encrypted vault from IndexedDB */
export async function deleteEncryptedVault(): Promise<void> {
  await doTransaction(STORE_VAULT, 'readwrite', (store) => store.delete(VAULT_KEY));
}

// ─── Auth Operations ─────────────────────────────────────────────────

interface StoredAuthRecord {
  id: string;
  verifierHash: ArrayBuffer;
  salt: ArrayBuffer;
  iterations: number;
  createdAt: number;
}

/** Save auth data (verifier hash + salt) to IndexedDB */
export async function saveAuthData(auth: AuthData): Promise<void> {
  const record: StoredAuthRecord = {
    id: AUTH_KEY,
    verifierHash: auth.verifierHash,
    salt: auth.salt.buffer as ArrayBuffer,
    iterations: auth.iterations,
    createdAt: auth.createdAt,
  };
  await doTransaction(STORE_AUTH, 'readwrite', (store) => store.put(record));
}

/** Load auth data from IndexedDB */
export async function loadAuthData(): Promise<AuthData | null> {
  const result = await doTransaction<StoredAuthRecord | undefined>(
    STORE_AUTH,
    'readonly',
    (store) => store.get(AUTH_KEY),
  );

  if (!result) {
    return null;
  }

  return {
    verifierHash: result.verifierHash,
    salt: new Uint8Array(result.salt),
    iterations: result.iterations,
    createdAt: result.createdAt,
  };
}

/** Delete auth data from IndexedDB */
export async function deleteAuthData(): Promise<void> {
  await doTransaction(STORE_AUTH, 'readwrite', (store) => store.delete(AUTH_KEY));
}

/** Check if a vault has been set up (auth data exists) */
export async function isVaultSetUp(): Promise<boolean> {
  const auth = await loadAuthData();
  return auth !== null;
}

/** Completely wipe all data (factory reset) */
export async function wipeAllData(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_VAULT, STORE_AUTH], 'readwrite');
  tx.objectStore(STORE_VAULT).clear();
  tx.objectStore(STORE_AUTH).clear();

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
