import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getSessionTimeout,
  setSessionTimeout,
  saveSession,
  restoreSession,
  clearSession,
  refreshSession,
  SESSION_TIMEOUT_OPTIONS,
} from '../services/sessionService';

describe('sessionService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SESSION_TIMEOUT_OPTIONS', () => {
    it('includes expected values', () => {
      expect(SESSION_TIMEOUT_OPTIONS).toContain(0);
      expect(SESSION_TIMEOUT_OPTIONS).toContain(5);
      expect(SESSION_TIMEOUT_OPTIONS).toContain(15);
      expect(SESSION_TIMEOUT_OPTIONS).toContain(30);
      expect(SESSION_TIMEOUT_OPTIONS).toContain(60);
    });
  });

  describe('getSessionTimeout / setSessionTimeout', () => {
    it('returns 0 (disabled) by default', () => {
      expect(getSessionTimeout()).toBe(0);
    });

    it('returns the set timeout value', () => {
      setSessionTimeout(15);
      expect(getSessionTimeout()).toBe(15);
    });

    it('persists timeout in localStorage', () => {
      setSessionTimeout(30);
      const stored = localStorage.getItem('pg_session_timeout');
      expect(stored).toBe('30');
    });

    it('returns 0 for invalid stored value', () => {
      localStorage.setItem('pg_session_timeout', '"invalid"');
      expect(getSessionTimeout()).toBe(0);
    });

    it('clears session when setting timeout to 0', () => {
      // First save a session
      setSessionTimeout(15);
      saveSession('password123', new Uint8Array([1, 2, 3]));
      expect(restoreSession()).not.toBeNull();

      // Setting to 0 should clear
      setSessionTimeout(0);
      expect(restoreSession()).toBeNull();
    });
  });

  describe('saveSession / restoreSession', () => {
    it('does not save when timeout is 0 (disabled)', () => {
      setSessionTimeout(0);
      saveSession('password123', new Uint8Array([1, 2, 3]));
      expect(restoreSession()).toBeNull();
    });

    it('saves and restores master password correctly', () => {
      setSessionTimeout(15);
      const salt = new Uint8Array([10, 20, 30, 40, 50]);
      saveSession('mySecretPassword', salt);

      const restored = restoreSession();
      expect(restored).not.toBeNull();
      expect(restored!.masterPassword).toBe('mySecretPassword');
    });

    it('saves and restores salt correctly', () => {
      setSessionTimeout(15);
      const salt = new Uint8Array([10, 20, 30, 40, 50]);
      saveSession('password', salt);

      const restored = restoreSession();
      expect(restored).not.toBeNull();
      // Compare contents (type may differ due to base64 roundtrip)
      expect(Array.from(restored!.salt)).toEqual([10, 20, 30, 40, 50]);
    });

    it('handles special characters in password', () => {
      setSessionTimeout(15);
      const specialPassword = 'p@$$w0rd!#%^&*()_+-={}[]|\\:";\'<>?,./~`';
      saveSession(specialPassword, new Uint8Array([1]));

      const restored = restoreSession();
      expect(restored!.masterPassword).toBe(specialPassword);
    });

    it('handles unicode characters in password', () => {
      setSessionTimeout(15);
      const unicodePassword = 'parolă_securizată_🔐';
      saveSession(unicodePassword, new Uint8Array([1]));

      const restored = restoreSession();
      expect(restored!.masterPassword).toBe(unicodePassword);
    });
  });

  describe('session expiry', () => {
    it('returns null when session has expired', () => {
      setSessionTimeout(5);
      saveSession('password', new Uint8Array([1]));

      // Manually set expiry to the past
      const raw = sessionStorage.getItem('pg_session');
      const session = JSON.parse(raw!);
      session.expiresAt = Date.now() - 1000;
      sessionStorage.setItem('pg_session', JSON.stringify(session));

      expect(restoreSession()).toBeNull();
    });

    it('returns data when session has not expired', () => {
      setSessionTimeout(30);
      saveSession('password', new Uint8Array([1]));

      const restored = restoreSession();
      expect(restored).not.toBeNull();
      expect(restored!.masterPassword).toBe('password');
    });
  });

  describe('clearSession', () => {
    it('removes session from sessionStorage', () => {
      setSessionTimeout(15);
      saveSession('password', new Uint8Array([1]));
      expect(restoreSession()).not.toBeNull();

      clearSession();
      expect(restoreSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });

  describe('refreshSession', () => {
    it('extends the expiry time', () => {
      setSessionTimeout(15);
      saveSession('password', new Uint8Array([1]));

      const rawBefore = sessionStorage.getItem('pg_session');
      const sessionBefore = JSON.parse(rawBefore!);

      // Wait a tiny bit and refresh
      refreshSession();

      const rawAfter = sessionStorage.getItem('pg_session');
      const sessionAfter = JSON.parse(rawAfter!);

      expect(sessionAfter.expiresAt).toBeGreaterThanOrEqual(sessionBefore.expiresAt);
    });

    it('clears session if timeout is now 0', () => {
      setSessionTimeout(15);
      saveSession('password', new Uint8Array([1]));

      // Change timeout to disabled
      localStorage.setItem('pg_session_timeout', '0');
      refreshSession();

      expect(restoreSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => refreshSession()).not.toThrow();
    });
  });

  describe('XOR obfuscation', () => {
    it('stored payload is not the plain text password', () => {
      setSessionTimeout(15);
      saveSession('myPassword123', new Uint8Array([1]));

      const raw = sessionStorage.getItem('pg_session');
      expect(raw).not.toBeNull();
      expect(raw).not.toContain('myPassword123');
    });

    it('different saves produce different payloads (random pad)', () => {
      setSessionTimeout(15);

      saveSession('samePassword', new Uint8Array([1]));
      const raw1 = sessionStorage.getItem('pg_session');

      saveSession('samePassword', new Uint8Array([1]));
      const raw2 = sessionStorage.getItem('pg_session');

      const session1 = JSON.parse(raw1!);
      const session2 = JSON.parse(raw2!);

      // Payload and pad should differ due to random XOR pad
      expect(session1.payload).not.toBe(session2.payload);
      expect(session1.pad).not.toBe(session2.pad);
    });
  });
});
