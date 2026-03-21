export interface BreachCheckResult {
  breached: boolean;
  count: number;
}

const rangeCache = new Map<string, Map<string, number>>();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = '';

  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }

  return hex.toUpperCase();
}

async function sha1Hash(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-1', encoded);
  return toHex(digest);
}

function parseRangeResponse(responseText: string): Map<string, number> {
  const suffixMap = new Map<string, number>();

  for (const line of responseText.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const [suffix, countText] = trimmedLine.split(':');
    if (!suffix || !countText) {
      continue;
    }

    const parsedCount = Number.parseInt(countText, 10);
    suffixMap.set(suffix.toUpperCase(), Number.isNaN(parsedCount) ? 0 : parsedCount);
  }

  return suffixMap;
}

async function getRangeData(prefix: string, signal?: AbortSignal): Promise<Map<string, number>> {
  const cached = rangeCache.get(prefix);
  if (cached) {
    return cached;
  }

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    method: 'GET',
    headers: {
      'Add-Padding': 'true',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Breach service is unavailable right now.');
  }

  const text = await response.text();
  const parsed = parseRangeResponse(text);
  rangeCache.set(prefix, parsed);
  return parsed;
}

export async function checkPasswordBreach(password: string, signal?: AbortSignal): Promise<BreachCheckResult> {
  if (!password) {
    return { breached: false, count: 0 };
  }

  const hash = await sha1Hash(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const suffixMap = await getRangeData(prefix, signal);
  const count = suffixMap.get(suffix) ?? 0;

  return {
    breached: count > 0,
    count,
  };
}
