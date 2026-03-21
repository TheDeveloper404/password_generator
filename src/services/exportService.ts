/**
 * Export/Import service for vault data.
 * Exports as encrypted JSON files; imports and decrypts with password.
 */

import {
  deriveKey,
  encrypt,
  decrypt,
  generateSalt,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '../crypto/cryptoService';
import { PBKDF2_ITERATIONS } from '../crypto/constants';
import type { VaultData, VaultExport } from '../types/vault';

/**
 * Export the vault as an encrypted JSON string.
 * The user provides a password (can be the same master password or different).
 */
export async function exportVault(
  vault: VaultData,
  exportPassword: string,
): Promise<string> {
  const salt = generateSalt();
  const key = await deriveKey(exportPassword, salt, PBKDF2_ITERATIONS);
  const plaintext = JSON.stringify(vault);
  const { ciphertext, iv } = await encrypt(plaintext, key);

  const exportData: VaultExport = {
    format: 'passgen-encrypted',
    version: 1,
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    salt: uint8ArrayToBase64(salt),
    timestamp: Date.now(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a vault from an encrypted JSON string.
 * Decrypts using the provided password.
 *
 * @returns The decrypted VaultData on success
 * @throws Error on invalid format or wrong password
 */
export async function importVault(
  encryptedJson: string,
  importPassword: string,
): Promise<VaultData> {
  let exportData: VaultExport;

  try {
    exportData = JSON.parse(encryptedJson) as VaultExport;
  } catch {
    throw new Error('Invalid export file format');
  }

  if (exportData.format !== 'passgen-encrypted') {
    throw new Error('Unrecognized file format');
  }

  const salt = base64ToUint8Array(exportData.salt);
  const iv = base64ToUint8Array(exportData.iv);
  const ciphertext = base64ToArrayBuffer(exportData.ciphertext);

  const key = await deriveKey(importPassword, salt, PBKDF2_ITERATIONS);

  try {
    const plaintext = await decrypt(ciphertext, key, iv);
    const vault = JSON.parse(plaintext) as VaultData;

    // Validate structure
    if (!vault.entries || !Array.isArray(vault.entries)) {
      throw new Error('Invalid vault structure');
    }

    return vault;
  } catch (error) {
    if (error instanceof Error && error.message.includes('vault structure')) {
      throw error;
    }
    throw new Error('Wrong password or corrupted file');
  }
}

/** Trigger a browser download of the export data */
export function downloadExport(data: string, filename?: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `passgen-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Read a file selected by the user */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
