import type { Translations } from './i18n';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export interface PolicyCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface PolicyResult {
  compliant: boolean;
  passedChecks: number;
  totalChecks: number;
  compliancePercent: number;
  checks: PolicyCheck[];
}

export const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
};

export function evaluatePolicy(password: string, policy: PasswordPolicy, t?: Translations): PolicyResult {
  const checks: PolicyCheck[] = [
    {
      key: 'length',
      label: t ? t.policyMinLength(policy.minLength) : `Minimum ${policy.minLength} characters`,
      passed: password.length >= policy.minLength,
    },
  ];

  if (policy.requireUppercase) {
    checks.push({
      key: 'uppercase',
      label: t ? t.policyUppercase : 'At least one uppercase letter',
      passed: /[A-Z]/.test(password),
    });
  }

  if (policy.requireLowercase) {
    checks.push({
      key: 'lowercase',
      label: t ? t.policyLowercase : 'At least one lowercase letter',
      passed: /[a-z]/.test(password),
    });
  }

  if (policy.requireNumbers) {
    checks.push({
      key: 'numbers',
      label: t ? t.policyDigit : 'At least one digit',
      passed: /[0-9]/.test(password),
    });
  }

  if (policy.requireSymbols) {
    checks.push({
      key: 'symbols',
      label: t ? t.policySymbol : 'At least one symbol',
      passed: /[^A-Za-z0-9]/.test(password),
    });
  }

  const passedChecks = checks.filter((check) => check.passed).length;
  const totalChecks = checks.length;
  const compliancePercent = totalChecks === 0 ? 100 : Math.round((passedChecks / totalChecks) * 100);

  return {
    compliant: passedChecks === totalChecks,
    passedChecks,
    totalChecks,
    compliancePercent,
    checks,
  };
}
