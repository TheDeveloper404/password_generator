import { PolicyResult } from './policyUtils';
import { StrengthResult } from './strengthUtils';

export type TipSeverity = 'high' | 'medium' | 'low' | 'good';

export interface SecurityTip {
  id: string;
  severity: TipSeverity;
  text: string;
}

interface SecurityTipsInput {
  password: string;
  strength: StrengthResult;
  policy: PolicyResult;
  minEntropy: number;
  breachCount?: number | null;
}

const COMMON_PATTERNS = ['password', 'qwerty', 'letmein', 'welcome', 'admin', '123456'];

function hasSimpleSequence(password: string): boolean {
  const normalized = password.toLowerCase();
  return /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|asdf|zxcv)/.test(normalized);
}

export function getLiveSecurityTips(input: SecurityTipsInput): SecurityTip[] {
  const tips: SecurityTip[] = [];
  const { password, strength, policy, minEntropy, breachCount } = input;

  if (!password) {
    return [
      {
        id: 'empty',
        severity: 'low',
        text: 'Generează sau introdu o parolă pentru analiză live.',
      },
    ];
  }

  if (password.length < 12) {
    tips.push({
      id: 'length',
      severity: 'high',
      text: 'Crește lungimea la minim 12-16 caractere pentru rezistență mai bună.',
    });
  }

  if (COMMON_PATTERNS.some((pattern) => password.toLowerCase().includes(pattern))) {
    tips.push({
      id: 'common',
      severity: 'high',
      text: 'Evită cuvinte sau pattern-uri comune (ex: password, qwerty, 123456).',
    });
  }

  if (/(.)\1{2,}/.test(password)) {
    tips.push({
      id: 'repeat',
      severity: 'medium',
      text: 'Evită caractere repetitive consecutive (ex: aaa, 111).',
    });
  }

  if (hasSimpleSequence(password)) {
    tips.push({
      id: 'sequence',
      severity: 'medium',
      text: 'Evită secvențe previzibile (ex: 1234, abcd, qwer).',
    });
  }

  if (strength.entropy < minEntropy) {
    tips.push({
      id: 'entropy',
      severity: 'medium',
      text: `Ținta curentă este ${minEntropy} biți, iar parola are ${strength.entropy} biți.`,
    });
  }

  const failedPolicyChecks = policy.checks.filter((check) => !check.passed);
  if (failedPolicyChecks.length > 0) {
    tips.push({
      id: 'policy',
      severity: 'medium',
      text: `Reguli lipsă: ${failedPolicyChecks.slice(0, 2).map((check) => check.label).join(', ')}.`,
    });
  }

  if (typeof breachCount === 'number' && breachCount > 0) {
    tips.push({
      id: 'breach',
      severity: 'high',
      text: `Parola a fost găsită în leak-uri (${breachCount.toLocaleString()} apariții). Schimb-o imediat.`,
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: 'good',
      severity: 'good',
      text: 'Parola arată solid. Păstrează parole unice pentru fiecare cont important.',
    });
  }

  return tips.slice(0, 5);
}
