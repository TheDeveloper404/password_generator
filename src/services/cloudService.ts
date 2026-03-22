/**
 * Cloud sync service — stores/retrieves encrypted vault blobs in Supabase.
 *
 * ZERO-KNOWLEDGE: The server never sees plain-text passwords.
 * All encryption/decryption happens client-side using Web Crypto API.
 * Supabase only stores base64-encoded AES-256-GCM ciphertext + IV + salt.
 */

import { supabase, isCloudEnabled } from '../config/supabase';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from '../crypto/cryptoService';
import type { VaultData } from '../types/vault';
import { encryptVaultRaw } from './vaultService';
import { deriveKey, decrypt } from '../crypto/cryptoService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CloudVaultRow {
  encrypted_blob: string;
  iv: string;
  salt: string;
  version: number;
  updated_at: string;
}

/**
 * Upload the encrypted vault to Supabase.
 * Encrypts client-side, then upserts the base64 blob.
 */
export async function uploadVault(
  vault: VaultData,
  masterPassword: string,
): Promise<void> {
  if (!isCloudEnabled || !supabase) {
    throw new Error('Cloud sync is not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Encrypt vault client-side (fresh salt + IV every time)
  const { ciphertext, iv, salt } = await encryptVaultRaw(vault, masterPassword);

  const row = {
    user_id: user.id,
    encrypted_blob: arrayBufferToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    salt: uint8ArrayToBase64(salt),
    version: vault.version,
  };

  // Upsert: insert or update if user already has a vault row
  const { error } = await supabase
    .from('vaults')
    .upsert(row, { onConflict: 'user_id' });

  if (error) throw new Error(`Cloud upload failed: ${error.message}`);
}

/**
 * Download and decrypt vault from Supabase.
 * Returns null if no cloud vault exists.
 */
export async function downloadVault(
  masterPassword: string,
): Promise<VaultData | null> {
  if (!isCloudEnabled || !supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vaults')
    .select('encrypted_blob, iv, salt, version, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  // Decrypt client-side
  const ciphertext = base64ToArrayBuffer(data.encrypted_blob);
  const iv = base64ToUint8Array(data.iv);
  const salt = base64ToUint8Array(data.salt);

  const key = await deriveKey(masterPassword, salt);
  const plaintext = await decrypt(ciphertext, key, iv);
  return JSON.parse(plaintext) as VaultData;
}

/**
 * Check if a cloud vault exists for the current user.
 */
export async function hasCloudVault(): Promise<boolean> {
  if (!isCloudEnabled || !supabase) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('vaults')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !error && Boolean(data);
}

/**
 * Get cloud vault metadata without downloading the entire blob.
 */
export async function getCloudVaultMeta(): Promise<{
  version: number;
  updatedAt: string;
} | null> {
  if (!isCloudEnabled || !supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('vaults')
    .select('version, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;
  return { version: data.version, updatedAt: data.updated_at };
}

/**
 * Delete the cloud vault for the current user.
 */
export async function deleteCloudVault(): Promise<void> {
  if (!isCloudEnabled || !supabase) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('vaults')
    .delete()
    .eq('user_id', user.id);

  if (error) throw new Error(`Cloud delete failed: ${error.message}`);
}

/**
 * Subscribe to realtime changes on the user's vault row.
 * When another device uploads a new vault blob, this triggers a callback
 * so we can download + decrypt and merge/replace the local vault.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToVaultChanges(
  userId: string,
  onRemoteChange: () => void,
): () => void {
  if (!isCloudEnabled || !supabase) return () => {};

  const channel: RealtimeChannel = supabase
    .channel(`vault-sync-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'vaults',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        // A remote device updated the vault — notify the app
        onRemoteChange();
      },
    )
    .subscribe();

  return () => {
    void supabase?.removeChannel(channel);
  };
}
