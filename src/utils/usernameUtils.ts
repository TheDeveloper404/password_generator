export interface UsernameInput {
  firstName: string;
  lastName: string;
}

export interface UsernameResult {
  usernames: string[];
}

function normalize(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function randomDigits(len: number): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0]).slice(0, len).padStart(len, '0');
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const vals = new Uint32Array(1);
    crypto.getRandomValues(vals);
    const j = vals[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateUsernames(input: UsernameInput): UsernameResult {
  const first = normalize(input.firstName);
  const last = normalize(input.lastName);

  if (!first && !last) {
    return { usernames: [] };
  }

  const base = first || last;
  const d4 = randomDigits(4);
  const d3 = randomDigits(3);
  const d2 = randomDigits(2);
  const year = new Date().getFullYear().toString().slice(-2);

  const patterns: string[] = [];

  if (first && last) {
    patterns.push(
      `${first}${last}_${d4}`,
      `${first}.${last}${d3}`,
      `${first}_${last}${d2}`,
      `${first[0]}${last}_${d4}`,
      `${first}${last[0]}${d3}`,
      `${last}${first}_${d2}`,
      `${first}.${last}.${year}`,
      `${first[0]}${first[1] || ''}${last}${d3}`,
      `${first}_${last}_${d4}`,
      `${last}.${first}${d2}`,
      `${first}${d2}${last}`,
      `x_${first}${last}_${d3}`,
    );
  } else {
    patterns.push(
      `${base}_${d4}`,
      `${base}.${d3}`,
      `${base}${d4}`,
      `x_${base}_${d3}`,
      `${base}_${year}`,
      `${base}.${year}.${d2}`,
      `the_${base}_${d3}`,
      `${base}${d2}x`,
    );
  }

  return { usernames: shuffle(patterns).slice(0, 8) };
}
