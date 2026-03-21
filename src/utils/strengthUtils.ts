export interface StrengthResult {
  score: number;
  label: string;
  entropy: number;
  crackTime: string;
}

function formatCrackTime(seconds: number): string {
  if (seconds < 1) return '< 1 secundă';
  if (seconds < 60) return `${Math.round(seconds)} secunde`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minute`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} ore`;

  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} zile`;

  const years = days / 365;
  if (years < 1000) return `${Math.round(years)} ani`;

  return 'peste 1000 ani';
}

function getCharacterPoolSize(password: string): number {
  let poolSize = 0;

  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 33;

  return poolSize;
}

export function calculateStrength(
  password: string,
  options: { [key: string]: boolean }
): StrengthResult {
  if (!password) {
    return { score: 0, label: 'Very Weak', entropy: 0, crackTime: '< 1 secundă' };
  }

  const poolSize = getCharacterPoolSize(password);
  const entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0;

  let score = 0;

  if (entropy >= 28) score++;
  if (entropy >= 36) score++;
  if (entropy >= 60) score++;
  if (entropy >= 80) score++;

  if (password.length < 10) {
    score = Math.max(0, score - 1);
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const selectedTypes = Object.values(options).filter(Boolean).length;
  const presentTypes = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;

  if (selectedTypes > 1 && presentTypes < selectedTypes) {
    score = Math.max(0, score - 1);
  }

  score = Math.min(4, score);

  const guessesPerSecond = 10_000_000_000;
  const crackTimeSeconds = Math.pow(2, entropy) / guessesPerSecond;

  const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  return {
    score,
    label: labels[score],
    entropy: Number(entropy.toFixed(1)),
    crackTime: formatCrackTime(crackTimeSeconds),
  };
}