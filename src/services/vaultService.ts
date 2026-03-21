/**
 * Vault management service.
 * Handles CRUD operations on vault entries, search, filter, and persistence.
 * All data is encrypted before storage, decrypted only in memory.
 */

import { encrypt, decrypt, deriveKey, generateSalt } from '../crypto/cryptoService';
import { PBKDF2_ITERATIONS } from '../crypto/constants';
import { saveEncryptedVault, loadEncryptedVault } from '../db/indexedDB';
import type { VaultData, VaultEntry, EntryId, EncryptedVault } from '../types/vault';

/** Generate a unique entry ID */
function generateId(): EntryId {
  return crypto.randomUUID();
}

/** Create a new empty vault */
export function createEmptyVault(): VaultData {
  return {
    version: 1,
    entries: [],
    folders: ['General'],
    lastModified: Date.now(),
  };
}

/** Create a new vault entry with defaults */
export function createEntry(partial: Partial<VaultEntry> = {}): VaultEntry {
  const now = Date.now();
  return {
    id: generateId(),
    type: 'login',
    title: '',
    siteUrl: '',
    username: '',
    password: '',
    notes: '',
    tags: [],
    folder: 'General',
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/** Add an entry to the vault */
export function addEntry(vault: VaultData, entry: VaultEntry): VaultData {
  return {
    ...vault,
    entries: [...vault.entries, entry],
    lastModified: Date.now(),
  };
}

/** Update an existing entry */
export function updateEntry(vault: VaultData, id: EntryId, updates: Partial<VaultEntry>): VaultData {
  return {
    ...vault,
    entries: vault.entries.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e,
    ),
    lastModified: Date.now(),
  };
}

/** Delete an entry by ID */
export function deleteEntry(vault: VaultData, id: EntryId): VaultData {
  return {
    ...vault,
    entries: vault.entries.filter((e) => e.id !== id),
    lastModified: Date.now(),
  };
}

/** Get a single entry by ID */
export function getEntry(vault: VaultData, id: EntryId): VaultEntry | undefined {
  return vault.entries.find((e) => e.id === id);
}

/** Add a folder to the vault */
export function addFolder(vault: VaultData, folderName: string): VaultData {
  if (vault.folders.includes(folderName)) {
    return vault;
  }
  return {
    ...vault,
    folders: [...vault.folders, folderName],
    lastModified: Date.now(),
  };
}

/** Remove a folder (move entries to "General") */
export function removeFolder(vault: VaultData, folderName: string): VaultData {
  if (folderName === 'General') {
    return vault;
  }
  return {
    ...vault,
    folders: vault.folders.filter((f) => f !== folderName),
    entries: vault.entries.map((e) =>
      e.folder === folderName ? { ...e, folder: 'General', updatedAt: Date.now() } : e,
    ),
    lastModified: Date.now(),
  };
}

/** Toggle favorite status */
export function toggleFavorite(vault: VaultData, id: EntryId): VaultData {
  return {
    ...vault,
    entries: vault.entries.map((e) =>
      e.id === id ? { ...e, favorite: !e.favorite, updatedAt: Date.now() } : e,
    ),
    lastModified: Date.now(),
  };
}

// ─── Search & Filter ─────────────────────────────────────────────────

export interface VaultFilter {
  search?: string;
  folder?: string;
  tag?: string;
  favoritesOnly?: boolean;
}

/** Filter and search vault entries */
export function filterEntries(vault: VaultData, filter: VaultFilter): VaultEntry[] {
  let result = [...vault.entries];

  if (filter.folder) {
    result = result.filter((e) => e.folder === filter.folder);
  }

  if (filter.tag) {
    result = result.filter((e) => e.tags.includes(filter.tag!));
  }

  if (filter.favoritesOnly) {
    result = result.filter((e) => e.favorite);
  }

  if (filter.search) {
    const query = filter.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.siteUrl.toLowerCase().includes(query) ||
        e.username.toLowerCase().includes(query) ||
        e.notes.toLowerCase().includes(query) ||
        e.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }

  // Sort: favorites first, then by most recently updated
  result.sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });

  return result;
}

/** Get all unique tags across vault entries */
export function getAllTags(vault: VaultData): string[] {
  const tagSet = new Set<string>();
  for (const entry of vault.entries) {
    for (const tag of entry.tags) {
      tagSet.add(tag);
    }
  }
  return [...tagSet].sort();
}

// ─── Encrypt / Decrypt Vault ─────────────────────────────────────────

/** Encrypt the entire vault and save to IndexedDB */
export async function encryptAndSaveVault(
  vault: VaultData,
  masterPassword: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<void> {
  const key = await deriveKey(masterPassword, salt);
  const plaintext = JSON.stringify(vault);
  const { ciphertext, iv } = await encrypt(plaintext, key);

  const encryptedVault: EncryptedVault = {
    id: 'primary',
    ciphertext,
    iv,
    salt,
    version: vault.version,
    timestamp: Date.now(),
  };

  await saveEncryptedVault(encryptedVault);
}

/** Load and decrypt vault from IndexedDB */
export async function loadAndDecryptVault(
  masterPassword: string,
): Promise<VaultData | null> {
  const encrypted = await loadEncryptedVault();
  if (!encrypted) {
    return null;
  }

  const key = await deriveKey(masterPassword, encrypted.salt);
  const plaintext = await decrypt(encrypted.ciphertext, key, encrypted.iv);
  return JSON.parse(plaintext) as VaultData;
}

/** Encrypt vault data to raw components (for export) */
export async function encryptVaultRaw(
  vault: VaultData,
  masterPassword: string,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer> }> {
  const salt = generateSalt();
  const key = await deriveKey(masterPassword, salt, PBKDF2_ITERATIONS);
  const plaintext = JSON.stringify(vault);
  const { ciphertext, iv } = await encrypt(plaintext, key);
  return { ciphertext, iv, salt };
}
