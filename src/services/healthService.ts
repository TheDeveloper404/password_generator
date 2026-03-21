/**
 * Password health analysis service.
 * Analyzes vault entries for weak, reused, old, and empty passwords.
 * Calculates an overall security score.
 */

import type { VaultData, VaultEntry, HealthReport } from '../types/vault';
import { calculateStrength } from '../utils/strengthUtils';

/** Number of days after which a password is considered "old" */
const OLD_PASSWORD_DAYS = 90;

/** Analyze all vault entries and produce a health report */
export function analyzeVaultHealth(vault: VaultData): HealthReport {
  const entries = vault.entries.filter((e) => e.type === 'login');

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      weakPasswords: [],
      reusedPasswords: new Map(),
      oldPasswords: [],
      emptyPasswords: [],
      securityScore: 100,
    };
  }

  // Find empty passwords
  const emptyPasswords = entries.filter((e) => !e.password.trim());

  // Find weak passwords (score ≤ 2 out of 4)
  const weakPasswords = entries.filter((e) => {
    if (!e.password) return false;
    const strength = calculateStrength(e.password, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    return strength.score <= 2;
  });

  // Find reused passwords
  const passwordMap = new Map<string, VaultEntry[]>();
  for (const entry of entries) {
    if (!entry.password) continue;
    const existing = passwordMap.get(entry.password) ?? [];
    existing.push(entry);
    passwordMap.set(entry.password, existing);
  }
  const reusedPasswords = new Map<string, VaultEntry[]>();
  for (const [pw, items] of passwordMap) {
    if (items.length > 1) {
      reusedPasswords.set(pw, items);
    }
  }

  // Find old passwords (not updated in > 90 days)
  const cutoff = Date.now() - OLD_PASSWORD_DAYS * 24 * 60 * 60 * 1000;
  const oldPasswords = entries.filter((e) => e.password && e.updatedAt < cutoff);

  // Calculate security score (0-100)
  const securityScore = calculateSecurityScore(
    entries.length,
    weakPasswords.length,
    reusedPasswords.size,
    oldPasswords.length,
    emptyPasswords.length,
  );

  return {
    totalEntries: entries.length,
    weakPasswords,
    reusedPasswords,
    oldPasswords,
    emptyPasswords,
    securityScore,
  };
}

/**
 * Calculate a 0-100 security score.
 *
 * Deductions:
 *   - Weak passwords: -15 points per (max -40)
 *   - Reused password groups: -20 points per (max -40)
 *   - Old passwords: -5 points per (max -20)
 *   - Empty passwords: -10 points per (max -30)
 */
function calculateSecurityScore(
  totalEntries: number,
  weakCount: number,
  reusedGroups: number,
  oldCount: number,
  emptyCount: number,
): number {
  if (totalEntries === 0) return 100;

  let score = 100;

  // Deduct for weak passwords (proportional to total)
  const weakRatio = weakCount / totalEntries;
  score -= Math.min(40, Math.round(weakRatio * 60));

  // Deduct for reused password groups
  const reusedPenalty = Math.min(40, reusedGroups * 20);
  score -= reusedPenalty;

  // Deduct for old passwords
  const oldRatio = oldCount / totalEntries;
  score -= Math.min(20, Math.round(oldRatio * 30));

  // Deduct for empty passwords
  const emptyPenalty = Math.min(30, emptyCount * 10);
  score -= emptyPenalty;

  return Math.max(0, Math.min(100, score));
}

/** Get a label and color for a security score */
export function getScoreInfo(score: number): {
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
} {
  if (score >= 90) return { label: 'Excelent', labelEn: 'Excellent', color: 'text-emerald-500', bgColor: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Bun', labelEn: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-500' };
  if (score >= 50) return { label: 'Mediu', labelEn: 'Fair', color: 'text-amber-500', bgColor: 'bg-amber-500' };
  if (score >= 30) return { label: 'Slab', labelEn: 'Poor', color: 'text-orange-500', bgColor: 'bg-orange-500' };
  return { label: 'Critic', labelEn: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500' };
}
