import { PolicyResult } from './policyUtils';
import { StrengthResult } from './strengthUtils';
import type { Translations } from './i18n';

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
  piiExposure?: boolean;
  piiMatches?: string[];
  t?: Translations;
}

const COMMON_PATTERNS = ['password', 'qwerty', 'letmein', 'welcome', 'admin', '123456'];

function hasSimpleSequence(password: string): boolean {
  const normalized = password.toLowerCase();
  return /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|asdf|zxcv)/.test(normalized);
}

export function getLiveSecurityTips(input: SecurityTipsInput): SecurityTip[] {
  const tips: SecurityTip[] = [];
  const { password, strength, policy, minEntropy, breachCount, piiExposure, piiMatches, t } = input;

  if (!password) {
    return [
      {
        id: 'empty',
        severity: 'low',
        text: t?.tipEmpty ?? 'Generează sau introdu o parolă pentru analiză live.',
      },
    ];
  }

  if (password.length < 12) {
    tips.push({
      id: 'length',
      severity: 'high',
      text: t?.tipLength ?? 'Crește lungimea la minim 12-16 caractere pentru rezistență mai bună.',
    });
  }

  if (COMMON_PATTERNS.some((pattern) => password.toLowerCase().includes(pattern))) {
    tips.push({
      id: 'common',
      severity: 'high',
      text: t?.tipCommon ?? 'Evită cuvinte sau pattern-uri comune (ex: password, qwerty, 123456).',
    });
  }

  if (/(.)\1{2,}/.test(password)) {
    tips.push({
      id: 'repeat',
      severity: 'medium',
      text: t?.tipRepeat ?? 'Evită caractere repetitive consecutive (ex: aaa, 111).',
    });
  }

  if (hasSimpleSequence(password)) {
    tips.push({
      id: 'sequence',
      severity: 'medium',
      text: t?.tipSequence ?? 'Evită secvențe previzibile (ex: 1234, abcd, qwer).',
    });
  }

  if (strength.entropy < minEntropy) {
    tips.push({
      id: 'entropy',
      severity: 'medium',
      text: t
        ? t.tipEntropy(minEntropy, strength.entropy)
        : `Ținta curentă este ${minEntropy} biți, iar parola are ${strength.entropy} biți.`,
    });
  }

  const failedPolicyChecks = policy.checks.filter((check) => !check.passed);
  if (failedPolicyChecks.length > 0) {
    const labels = failedPolicyChecks.slice(0, 2).map((check) => check.label).join(', ');
    tips.push({
      id: 'policy',
      severity: 'medium',
      text: t ? t.tipPolicy(labels) : `Reguli lipsă: ${labels}.`,
    });
  }

  if (typeof breachCount === 'number' && breachCount > 0) {
    tips.push({
      id: 'breach',
      severity: 'high',
      text: t
        ? t.tipBreach(breachCount.toLocaleString())
        : `Parola a fost găsită în leak-uri (${breachCount.toLocaleString()} apariții). Schimb-o imediat.`,
    });
  }

  if (piiExposure) {
    const sample = piiMatches?.slice(0, 2).join(', ');
    tips.push({
      id: 'pii',
      severity: 'high',
      text: sample
        ? (t?.tipPiiWithSample(sample) ?? `Parola conține date personale (${sample}). Evită nume/email/domeniu în parolă.`)
        : (t?.tipPiiGeneric ?? 'Parola conține date personale. Evită nume/email/domeniu în parolă.'),
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: 'good',
      severity: 'good',
      text: t?.tipGood ?? 'Parola arată solid. Păstrează parole unice pentru fiecare cont important.',
    });
  }

  return tips.slice(0, 5);
}
