import { describe, it, expect } from 'vitest';
import { generatePassword, generatePassphrase, PASSWORD_PRESETS } from '../utils/passwordUtils';
import type { PasswordCharacterOptions, PassphraseOptions } from '../utils/passwordUtils';

describe('generatePassword', () => {
  it('generates a password of the requested length', () => {
    const pwd = generatePassword(16, { uppercase: true, lowercase: true, numbers: true, symbols: true });
    expect(pwd).toHaveLength(16);
  });

  it('generates a password with only lowercase when no options selected', () => {
    const pwd = generatePassword(12, { uppercase: false, lowercase: false, numbers: false, symbols: false });
    expect(pwd).toHaveLength(12);
    expect(pwd).toMatch(/^[a-z]+$/);
  });

  it('includes uppercase letters when requested', () => {
    const pwd = generatePassword(20, { uppercase: true, lowercase: false, numbers: false, symbols: false });
    expect(pwd).toMatch(/^[A-Z]+$/);
  });

  it('includes lowercase letters when requested', () => {
    const pwd = generatePassword(20, { uppercase: false, lowercase: true, numbers: false, symbols: false });
    expect(pwd).toMatch(/^[a-z]+$/);
  });

  it('includes numbers when requested', () => {
    const pwd = generatePassword(20, { uppercase: false, lowercase: false, numbers: true, symbols: false });
    expect(pwd).toMatch(/^[0-9]+$/);
  });

  it('includes symbols when requested', () => {
    const pwd = generatePassword(20, { uppercase: false, lowercase: false, numbers: false, symbols: true });
    expect(pwd).toMatch(/^[^A-Za-z0-9]+$/);
  });

  it('includes all character types when all options enabled', () => {
    // Run multiple times to ensure at least one has all types (guaranteed by algorithm)
    const pwd = generatePassword(20, { uppercase: true, lowercase: true, numbers: true, symbols: true });
    expect(pwd).toMatch(/[A-Z]/);
    expect(pwd).toMatch(/[a-z]/);
    expect(pwd).toMatch(/[0-9]/);
    expect(pwd).toMatch(/[^A-Za-z0-9]/);
  });

  it('handles minimum length edge case (length < number of required types)', () => {
    const pwd = generatePassword(2, { uppercase: true, lowercase: true, numbers: true, symbols: true });
    // Should be at least 4 characters (one per type)
    expect(pwd.length).toBeGreaterThanOrEqual(4);
  });

  it('generates different passwords on successive calls', () => {
    const opts: PasswordCharacterOptions = { uppercase: true, lowercase: true, numbers: true, symbols: true };
    const passwords = new Set<string>();
    for (let i = 0; i < 20; i++) {
      passwords.add(generatePassword(16, opts));
    }
    // Should almost certainly produce at least 15 unique passwords
    expect(passwords.size).toBeGreaterThanOrEqual(15);
  });

  it('generates passwords of various lengths', () => {
    const opts: PasswordCharacterOptions = { uppercase: true, lowercase: true, numbers: true, symbols: false };
    for (const len of [4, 8, 16, 32, 64, 128]) {
      const pwd = generatePassword(len, opts);
      expect(pwd.length).toBe(Math.max(len, 3)); // 3 = number of enabled types
    }
  });
});

describe('generatePassphrase', () => {
  it('generates a passphrase with the requested word count', () => {
    const opts: PassphraseOptions = { wordCount: 4, separator: '-', capitalize: false, includeNumber: false };
    const phrase = generatePassphrase(opts);
    const words = phrase.split('-');
    expect(words).toHaveLength(4);
  });

  it('uses the specified separator', () => {
    for (const sep of ['-', '_', '.'] as const) {
      const opts: PassphraseOptions = { wordCount: 3, separator: sep, capitalize: false, includeNumber: false };
      const phrase = generatePassphrase(opts);
      expect(phrase).toContain(sep);
      expect(phrase.split(sep)).toHaveLength(3);
    }
  });

  it('capitalizes words when capitalize is true', () => {
    const opts: PassphraseOptions = { wordCount: 4, separator: '-', capitalize: true, includeNumber: false };
    const phrase = generatePassphrase(opts);
    const words = phrase.split('-');
    words.forEach((word) => {
      expect(word[0]).toMatch(/[A-Z]/);
    });
  });

  it('does not capitalize when capitalize is false', () => {
    const opts: PassphraseOptions = { wordCount: 4, separator: '-', capitalize: false, includeNumber: false };
    const phrase = generatePassphrase(opts);
    const words = phrase.split('-');
    words.forEach((word) => {
      expect(word[0]).toMatch(/[a-z]/);
    });
  });

  it('appends separator + 2 digits when includeNumber is true', () => {
    const opts: PassphraseOptions = { wordCount: 3, separator: '-', capitalize: false, includeNumber: true };
    const phrase = generatePassphrase(opts);
    const parts = phrase.split('-');
    // 3 words + 1 number segment
    expect(parts).toHaveLength(4);
    expect(parts[3]).toMatch(/^\d{2}$/);
  });

  it('generates different passphrases on successive calls', () => {
    const opts: PassphraseOptions = { wordCount: 4, separator: '-', capitalize: true, includeNumber: true };
    const phrases = new Set<string>();
    for (let i = 0; i < 20; i++) {
      phrases.add(generatePassphrase(opts));
    }
    expect(phrases.size).toBeGreaterThanOrEqual(10);
  });
});

describe('PASSWORD_PRESETS', () => {
  it('has at least 4 presets defined', () => {
    expect(PASSWORD_PRESETS.length).toBeGreaterThanOrEqual(4);
  });

  it('each preset has required fields', () => {
    PASSWORD_PRESETS.forEach((preset) => {
      expect(preset.id).toBeDefined();
      expect(preset.label).toBeDefined();
      expect(['password', 'passphrase']).toContain(preset.mode);
      if (preset.mode === 'password') {
        expect(preset.length).toBeGreaterThan(0);
        expect(preset.options).toBeDefined();
      }
      if (preset.mode === 'passphrase') {
        expect(preset.passphraseOptions).toBeDefined();
      }
    });
  });

  it('includes wifi, banking, social, pin, and memorable presets', () => {
    const ids = PASSWORD_PRESETS.map((p) => p.id);
    expect(ids).toContain('wifi');
    expect(ids).toContain('banking');
    expect(ids).toContain('social');
    expect(ids).toContain('pin');
    expect(ids).toContain('memorable');
  });
});
