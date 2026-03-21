/**
 * Cryptographic constants for the vault encryption system.
 * Using Web Crypto API with AES-256-GCM for authenticated encryption.
 */

/** AES-GCM key length in bits */
export const AES_KEY_LENGTH = 256;

/** Initialization Vector length in bytes for AES-GCM */
export const IV_LENGTH = 12;

/** Salt length in bytes for key derivation */
export const SALT_LENGTH = 32;

/** PBKDF2 iteration count (OWASP 2024 recommendation for SHA-256) */
export const PBKDF2_ITERATIONS = 600_000;

/** Algorithm name for AES-GCM */
export const AES_ALGORITHM = 'AES-GCM';

/** Hash algorithm for PBKDF2 */
export const PBKDF2_HASH = 'SHA-256';

/** Algorithm name for PBKDF2 */
export const PBKDF2_ALGORITHM = 'PBKDF2';

/** Auto-lock timeout in milliseconds (5 minutes) */
export const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

/** Maximum master password attempts before temporary lockout */
export const MAX_UNLOCK_ATTEMPTS = 5;

/** Lockout duration in milliseconds (30 seconds) */
export const LOCKOUT_DURATION_MS = 30 * 1000;
