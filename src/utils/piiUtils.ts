export interface PIIContext {
  name?: string;
  email?: string;
  domain?: string;
}

export interface PIIExposureResult {
  hasExposure: boolean;
  matches: string[];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length >= 3 && !/^\d+$/.test(part));
}

function buildPIITokens(context: PIIContext): string[] {
  const tokens = new Set<string>();

  if (context.name) {
    for (const token of tokenize(context.name)) {
      tokens.add(token);
    }
  }

  if (context.email) {
    const email = normalize(context.email);
    const [local = '', host = ''] = email.split('@');

    for (const token of tokenize(local)) {
      tokens.add(token);
    }

    for (const token of tokenize(host)) {
      tokens.add(token);
    }
  }

  if (context.domain) {
    for (const token of tokenize(context.domain)) {
      tokens.add(token);
    }
  }

  return Array.from(tokens);
}

export function checkPIIExposure(password: string, context: PIIContext): PIIExposureResult {
  if (!password) {
    return { hasExposure: false, matches: [] };
  }

  const normalizedPassword = normalize(password);
  const piiTokens = buildPIITokens(context);

  const matches = piiTokens.filter((token) => normalizedPassword.includes(token));

  return {
    hasExposure: matches.length > 0,
    matches,
  };
}
