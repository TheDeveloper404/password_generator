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

export function evaluatePolicy(password: string, policy: PasswordPolicy): PolicyResult {
  const checks: PolicyCheck[] = [
    {
      key: 'length',
      label: `Minim ${policy.minLength} caractere`,
      passed: password.length >= policy.minLength,
    },
  ];

  if (policy.requireUppercase) {
    checks.push({
      key: 'uppercase',
      label: 'Cel puțin o literă mare',
      passed: /[A-Z]/.test(password),
    });
  }

  if (policy.requireLowercase) {
    checks.push({
      key: 'lowercase',
      label: 'Cel puțin o literă mică',
      passed: /[a-z]/.test(password),
    });
  }

  if (policy.requireNumbers) {
    checks.push({
      key: 'numbers',
      label: 'Cel puțin o cifră',
      passed: /[0-9]/.test(password),
    });
  }

  if (policy.requireSymbols) {
    checks.push({
      key: 'symbols',
      label: 'Cel puțin un simbol',
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
