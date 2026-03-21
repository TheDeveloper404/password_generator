import { describe, it, expect } from 'vitest';
import { generateUsernames } from '../utils/usernameUtils';

describe('generateUsernames', () => {
  it('returns empty array when both fields are empty', () => {
    const result = generateUsernames({ firstName: '', lastName: '' });
    expect(result.usernames).toHaveLength(0);
  });

  it('generates usernames with first and last name', () => {
    const result = generateUsernames({ firstName: 'John', lastName: 'Doe' });
    expect(result.usernames.length).toBeGreaterThan(0);
    expect(result.usernames.length).toBeLessThanOrEqual(8);
  });

  it('generates usernames with only first name', () => {
    const result = generateUsernames({ firstName: 'Alice', lastName: '' });
    expect(result.usernames.length).toBeGreaterThan(0);
    // All usernames should contain "alice" (normalized)
    result.usernames.forEach((u) => {
      expect(u.toLowerCase()).toContain('alice');
    });
  });

  it('generates usernames with only last name', () => {
    const result = generateUsernames({ firstName: '', lastName: 'Smith' });
    expect(result.usernames.length).toBeGreaterThan(0);
    result.usernames.forEach((u) => {
      expect(u.toLowerCase()).toContain('smith');
    });
  });

  it('normalizes diacritics and special characters', () => {
    const result = generateUsernames({ firstName: 'André', lastName: 'Müller' });
    expect(result.usernames.length).toBeGreaterThan(0);
    result.usernames.forEach((u) => {
      // Should not contain diacritics
      expect(u).not.toMatch(/[àáâãäåèéêëìíîïòóôõöùúûüýÿñ]/i);
    });
  });

  it('returns at most 8 usernames', () => {
    const result = generateUsernames({ firstName: 'John', lastName: 'Doe' });
    expect(result.usernames.length).toBeLessThanOrEqual(8);
  });

  it('generates different usernames on successive calls (randomized)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const r = generateUsernames({ firstName: 'Test', lastName: 'User' });
      r.usernames.forEach((u) => results.add(u));
    }
    // Should have many unique usernames across runs due to random digits
    expect(results.size).toBeGreaterThan(8);
  });

  it('handles whitespace in input', () => {
    const result = generateUsernames({ firstName: '  John  ', lastName: '  Doe  ' });
    expect(result.usernames.length).toBeGreaterThan(0);
    result.usernames.forEach((u) => {
      expect(u).not.toMatch(/\s/);
    });
  });

  it('handles all-special characters input as empty', () => {
    const result = generateUsernames({ firstName: '!!!', lastName: '@@@' });
    expect(result.usernames).toHaveLength(0);
  });

  it('usernames contain only valid characters', () => {
    const result = generateUsernames({ firstName: 'Maria', lastName: 'Pop' });
    result.usernames.forEach((u) => {
      // Should only contain a-z, 0-9, _, ., x (prefix)
      expect(u).toMatch(/^[a-z0-9_.]+$/);
    });
  });
});
