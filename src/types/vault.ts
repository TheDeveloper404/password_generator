/** Unique identifier for vault entries */
export type EntryId = string;

/** Supported entry types in the vault */
export type EntryType = 'login' | 'note';

/** A single login credential stored in the vault */
export interface VaultEntry {
  id: EntryId;
  type: EntryType;
  title: string;
  siteUrl: string;
  username: string;
  password: string;
  notes: string;
  tags: string[];
  folder: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

/** The complete vault data structure (decrypted in-memory only) */
export interface VaultData {
  version: number;
  entries: VaultEntry[];
  folders: string[];
  lastModified: number;
}

/** Encrypted vault blob stored in IndexedDB */
export interface EncryptedVault {
  id: string;
  ciphertext: ArrayBuffer;
  iv: Uint8Array<ArrayBuffer>;
  salt: Uint8Array<ArrayBuffer>;
  version: number;
  timestamp: number;
}

/** Master password verification data (stored separately) */
export interface AuthData {
  verifierHash: ArrayBuffer;
  salt: Uint8Array<ArrayBuffer>;
  iterations: number;
  createdAt: number;
}

/** Result of vault health analysis */
export interface HealthReport {
  totalEntries: number;
  weakPasswords: VaultEntry[];
  reusedPasswords: Map<string, VaultEntry[]>;
  oldPasswords: VaultEntry[];
  emptyPasswords: VaultEntry[];
  securityScore: number;
}

/** Export/import format */
export interface VaultExport {
  format: 'passgen-encrypted';
  version: number;
  ciphertext: string;
  iv: string;
  salt: string;
  timestamp: number;
}

/** Application state machine */
export type AppScreen =
  | 'welcome'
  | 'setup'
  | 'unlock'
  | 'main';

/** Main app tabs */
export type MainTab =
  | 'generator'
  | 'vault'
  | 'health';
