import { describe, it, expect } from 'vitest';
import { evaluatePolicy, DEFAULT_POLICY } from '../utils/policyUtils';
import type { PasswordPolicy } from '../utils/policyUtils';

describe('DEFAULT_POLICY', () => {
  it('has a minimum length of 12', () => {
    expect(DEFAULT_POLICY.minLength).toBe(12);
  });

  it('requires all character types', () => {
    expect(DEFAULT_POLICY.requireUppercase).toBe(true);
    expect(DEFAULT_POLICY.requireLowercase).toBe(true);
    expect(DEFAULT_POLICY.requireNumbers).toBe(true);
    expect(DEFAULT_POLICY.requireSymbols).toBe(true);
  });
});

describe('evaluatePolicy', () => {
  it('returns non-compliant for empty password', () => {
    const result = evaluatePolicy('', DEFAULT_POLICY);
    expect(result.compliant).toBe(false);
    expect(result.passedChecks).toBe(0);
    expect(result.compliancePercent).toBe(0);
  });

  it('returns compliant for a fully conforming password', () => {
    const result = evaluatePolicy('Abc123!@#xyz', DEFAULT_POLICY);
    expect(result.compliant).toBe(true);
    expect(result.passedChecks).toBe(result.totalChecks);
    expect(result.compliancePercent).toBe(100);
  });

  it('detects missing uppercase', () => {
    const result = evaluatePolicy('abc123!@#xyz', DEFAULT_POLICY);
    expect(result.compliant).toBe(false);
    const uppercaseCheck = result.checks.find((c) => c.key === 'uppercase');
    expect(uppercaseCheck?.passed).toBe(false);
  });

  it('detects missing lowercase', () => {
    const result = evaluatePolicy('ABC123!@#XYZ', DEFAULT_POLICY);
    expect(result.compliant).toBe(false);
    const lowercaseCheck = result.checks.find((c) => c.key === 'lowercase');
    expect(lowercaseCheck?.passed).toBe(false);
  });

  it('detects missing numbers', () => {
    const result = evaluatePolicy('Abcdef!@#xyz', DEFAULT_POLICY);
    expect(result.compliant).toBe(false);
    const numbersCheck = result.checks.find((c) => c.key === 'numbers');
    expect(numbersCheck?.passed).toBe(false);
  });

  it('detects missing symbols', () => {
    const result = evaluatePolicy('Abc123defXYZ', DEFAULT_POLICY);
    expect(result.compliant).toBe(false);
    const symbolsCheck = result.checks.find((c) => c.key === 'symbols');
    expect(symbolsCheck?.passed).toBe(false);
  });

  it('detects too short password', () => {
    const result = evaluatePolicy('Ab1!', DEFAULT_POLICY);
    const lengthCheck = result.checks.find((c) => c.key === 'length');
    expect(lengthCheck?.passed).toBe(false);
  });

  it('passes length check when password meets minimum', () => {
    const result = evaluatePolicy('Abc123!@#xyz', DEFAULT_POLICY);
    const lengthCheck = result.checks.find((c) => c.key === 'length');
    expect(lengthCheck?.passed).toBe(true);
  });

  it('calculates correct compliance percent', () => {
    // Only length and uppercase pass (2 out of 5)
    const result = evaluatePolicy('ABCDEFGHIJKLMNO', DEFAULT_POLICY);
    // length: pass, uppercase: pass, lowercase: fail, numbers: fail, symbols: fail
    expect(result.passedChecks).toBe(2);
    expect(result.totalChecks).toBe(5);
    expect(result.compliancePercent).toBe(40);
  });

  it('works with custom policy (no symbols required)', () => {
    const policy: PasswordPolicy = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
    };
    const result = evaluatePolicy('AbcDef12', policy);
    expect(result.compliant).toBe(true);
    expect(result.totalChecks).toBe(4); // length + 3 types (no symbols)
  });

  it('works with minimal policy (only length)', () => {
    const policy: PasswordPolicy = {
      minLength: 4,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSymbols: false,
    };
    const result = evaluatePolicy('abcd', policy);
    expect(result.compliant).toBe(true);
    expect(result.totalChecks).toBe(1);
    expect(result.compliancePercent).toBe(100);
  });

  it('uses translation strings when provided', () => {
    const translations = {
      policyMinLength: (n: number) => `Minim ${n} caractere`,
      policyUppercase: 'Cel puțin o literă mare',
      policyLowercase: 'Cel puțin o literă mică',
      policyDigit: 'Cel puțin o cifră',
      policySymbol: 'Cel puțin un simbol',
    } as unknown as Parameters<typeof evaluatePolicy>[2];

    const result = evaluatePolicy('short', DEFAULT_POLICY, translations);
    const lengthCheck = result.checks.find((c) => c.key === 'length');
    expect(lengthCheck?.label).toContain('Minim');
    expect(lengthCheck?.label).toContain('12');
  });

  it('returns fallback English labels without translations', () => {
    const result = evaluatePolicy('short', DEFAULT_POLICY);
    const lengthCheck = result.checks.find((c) => c.key === 'length');
    expect(lengthCheck?.label).toContain('Minimum');
    expect(lengthCheck?.label).toContain('12');
  });

  it('checks array always has length check first', () => {
    const result = evaluatePolicy('test', DEFAULT_POLICY);
    expect(result.checks[0].key).toBe('length');
  });

  it('returns totalChecks equal to checks array length', () => {
    const result = evaluatePolicy('test', DEFAULT_POLICY);
    expect(result.totalChecks).toBe(result.checks.length);
  });
});
