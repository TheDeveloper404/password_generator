import { describe, it, expect } from 'vitest';
import { calculateStrength } from '../utils/strengthUtils';
import type { Translations } from '../utils/i18n';

describe('calculateStrength', () => {
  it('returns score 0 and Very Weak for empty password', () => {
    const result = calculateStrength('', {});
    expect(result.score).toBe(0);
    expect(result.label).toBe('Very Weak');
    expect(result.entropy).toBe(0);
  });

  it('returns low score for short numeric password', () => {
    const result = calculateStrength('1234', { numbers: true });
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.entropy).toBeGreaterThan(0);
  });

  it('returns higher score for longer mixed password', () => {
    const result = calculateStrength('Abc123!@#xyz', {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.entropy).toBeGreaterThanOrEqual(36);
  });

  it('returns Very Strong for very long complex password', () => {
    const result = calculateStrength('aB3$xY9#mN2@pQ8!wK5&', {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(result.score).toBe(4);
    expect(result.label).toBe('Very Strong');
  });

  it('penalizes short passwords (< 10 chars)', () => {
    const shortResult = calculateStrength('Ab1!Xy', { uppercase: true, lowercase: true, numbers: true, symbols: true });
    const longResult = calculateStrength('Ab1!XyZz9@Wq', { uppercase: true, lowercase: true, numbers: true, symbols: true });
    expect(longResult.score).toBeGreaterThanOrEqual(shortResult.score);
  });

  it('entropy increases with password length', () => {
    const short = calculateStrength('abc', {});
    const long = calculateStrength('abcdefghijklmnop', {});
    expect(long.entropy).toBeGreaterThan(short.entropy);
  });

  it('entropy increases with character pool diversity', () => {
    const numbersOnly = calculateStrength('12345678', { numbers: true });
    const mixed = calculateStrength('Ab3$Xy9!', { uppercase: true, lowercase: true, numbers: true, symbols: true });
    expect(mixed.entropy).toBeGreaterThan(numbersOnly.entropy);
  });

  it('calculates correct entropy for lowercase-only password', () => {
    // 26 chars pool, 8 chars → 8 * log2(26) ≈ 37.6
    const result = calculateStrength('abcdefgh', {});
    expect(result.entropy).toBeCloseTo(8 * Math.log2(26), 1);
  });

  it('calculates correct entropy for all character types', () => {
    // 95 chars pool (26+26+10+33), 10 chars → 10 * log2(95) ≈ 65.7
    const result = calculateStrength('aB3!xY9@mN', {});
    expect(result.entropy).toBeCloseTo(10 * Math.log2(95), 1);
  });

  it('returns valid crack time string', () => {
    const result = calculateStrength('abc', {});
    expect(typeof result.crackTime).toBe('string');
    expect(result.crackTime.length).toBeGreaterThan(0);
  });

  it('returns "over 1000 years" for very strong passwords', () => {
    const result = calculateStrength('aB3$xY9#mN2@pQ8!wK5&rT7^', {});
    expect(result.crackTime).toContain('year');
  });

  it('uses translation strings when provided', () => {
    const translations = {
      veryWeak: 'Foarte slabă',
      weak: 'Slabă',
      medium: 'Medie',
      strong: 'Puternică',
      veryStrong: 'Foarte puternică',
      crackLessThan1s: '< 1 secundă',
      crackSeconds: (n: number) => `${n} secunde`,
      crackMinutes: (n: number) => `${n} minute`,
      crackHours: (n: number) => `${n} ore`,
      crackDays: (n: number) => `${n} zile`,
      crackYears: (n: number) => `${n} ani`,
      crackOver1000: 'peste 1000 ani',
    } as unknown as Translations;

    const result = calculateStrength('', {}, translations);
    expect(result.label).toBe('Foarte slabă');
    expect(result.crackTime).toBe('< 1 secundă');
  });

  it('score never exceeds 4', () => {
    const result = calculateStrength('aB3$xY9#mN2@pQ8!wK5&rT7^vU1*', {});
    expect(result.score).toBeLessThanOrEqual(4);
  });

  it('score is never negative', () => {
    const result = calculateStrength('a', {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('returns correct strength labels in order', () => {
    const labels: string[] = [];

    // Very Weak
    labels.push(calculateStrength('', {}).label);
    // Weak
    labels.push(calculateStrength('abcdefgh', {}).label);
    // Strong to Very Strong
    labels.push(calculateStrength('aB3$xY9#mN2@pQ8!wK5&', {}).label);

    expect(labels[0]).toBe('Very Weak');
    expect(['Weak', 'Medium']).toContain(labels[1]);
    expect(['Strong', 'Very Strong']).toContain(labels[2]);
  });
});
