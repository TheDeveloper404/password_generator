/**
 * CSV Import utility for password vaults.
 * Supports: Chrome/Edge, Firefox, Bitwarden, LastPass, 1Password, KeePass, generic CSV.
 * All processing is 100% client-side — no data leaves the browser.
 */

import type { VaultEntry } from '../types/vault';

export type ImportSource =
  | 'chrome'
  | 'bitwarden'
  | 'lastpass'
  | '1password'
  | 'keepass'
  | 'auto';

export interface ImportResult {
  entries: Partial<VaultEntry>[];
  source: string;
  skipped: number;
  total: number;
}

/* ── CSV Parser ─────────────────────────────────────────────────── */

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (fields[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

/* ── Source detection ────────────────────────────────────────────── */

function detectSource(headers: string[]): ImportSource {
  const h = headers.join(',');

  // Chrome/Edge: name,url,username,password
  if (h.includes('name') && h.includes('url') && h.includes('username') && h.includes('password') && !h.includes('folder')) {
    return 'chrome';
  }

  // Bitwarden: folder,favorite,type,name,notes,fields,reprompt,login_uri,login_username,login_password
  if (h.includes('login_uri') || h.includes('login_username') || h.includes('login_password')) {
    return 'bitwarden';
  }

  // LastPass: url,username,password,totp,extra,name,grouping,fav
  if (h.includes('grouping') || (h.includes('extra') && h.includes('fav'))) {
    return 'lastpass';
  }

  // 1Password: Title,Url,Username,Password (or similar)
  if (h.includes('title') && h.includes('username') && h.includes('password')) {
    return '1password';
  }

  // KeePass: Group,Title,Username,Password,URL,Notes
  if (h.includes('group') && h.includes('title') && h.includes('username')) {
    return 'keepass';
  }

  return 'auto';
}

/* ── Column mapping per source ──────────────────────────────────── */

interface ColumnMap {
  title: string[];
  url: string[];
  username: string[];
  password: string[];
  notes: string[];
  folder: string[];
  tags: string[];
}

const COLUMN_MAPS: Record<ImportSource, ColumnMap> = {
  chrome: {
    title: ['name'],
    url: ['url'],
    username: ['username'],
    password: ['password'],
    notes: ['note', 'notes'],
    folder: [],
    tags: [],
  },
  bitwarden: {
    title: ['name'],
    url: ['login_uri'],
    username: ['login_username'],
    password: ['login_password'],
    notes: ['notes'],
    folder: ['folder'],
    tags: [],
  },
  lastpass: {
    title: ['name'],
    url: ['url'],
    username: ['username'],
    password: ['password'],
    notes: ['extra'],
    folder: ['grouping'],
    tags: [],
  },
  '1password': {
    title: ['title'],
    url: ['url', 'urls'],
    username: ['username'],
    password: ['password'],
    notes: ['notes', 'notesplain'],
    folder: ['vault', 'folder'],
    tags: ['tags'],
  },
  keepass: {
    title: ['title', 'account'],
    url: ['url', 'web site'],
    username: ['username', 'user name', 'login name'],
    password: ['password'],
    notes: ['notes'],
    folder: ['group'],
    tags: [],
  },
  auto: {
    title: ['name', 'title', 'site', 'account', 'service'],
    url: ['url', 'uri', 'website', 'web site', 'login_uri', 'login url'],
    username: ['username', 'user', 'email', 'login', 'login_username', 'user name', 'login name'],
    password: ['password', 'pass', 'login_password', 'secret'],
    notes: ['notes', 'note', 'extra', 'comment', 'comments', 'description'],
    folder: ['folder', 'group', 'grouping', 'category', 'vault'],
    tags: ['tags', 'labels', 'tag'],
  },
};

function findColumn(row: Record<string, string>, candidates: string[]): string {
  for (const c of candidates) {
    if (c in row && row[c]) return row[c];
  }
  return '';
}

/* ── Main import function ───────────────────────────────────────── */

export function importCSV(text: string, forceSource?: ImportSource): ImportResult {
  const { headers, rows } = parseCSV(text);

  if (headers.length === 0 || rows.length === 0) {
    return { entries: [], source: 'unknown', skipped: 0, total: 0 };
  }

  const source = forceSource === 'auto' || !forceSource ? detectSource(headers) : forceSource;
  const map = COLUMN_MAPS[source] ?? COLUMN_MAPS.auto;

  const entries: Partial<VaultEntry>[] = [];
  let skipped = 0;

  for (const row of rows) {
    const title = findColumn(row, map.title);
    const password = findColumn(row, map.password);
    const username = findColumn(row, map.username);
    const url = findColumn(row, map.url);

    // Skip rows without a title or password+username
    if (!title && !password && !username) {
      skipped++;
      continue;
    }

    const notes = findColumn(row, map.notes);
    const folder = findColumn(row, map.folder) || 'Imported';
    const tagsStr = findColumn(row, map.tags);
    const tags = tagsStr ? tagsStr.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [];

    entries.push({
      type: 'login',
      title: title || url || 'Untitled',
      siteUrl: url,
      username,
      password,
      notes,
      folder,
      tags,
      favorite: false,
    });
  }

  const sourceLabels: Record<ImportSource, string> = {
    chrome: 'Chrome / Edge',
    bitwarden: 'Bitwarden',
    lastpass: 'LastPass',
    '1password': '1Password',
    keepass: 'KeePass',
    auto: 'CSV',
  };

  return {
    entries,
    source: sourceLabels[source],
    skipped,
    total: rows.length,
  };
}

/** Get list of supported sources with labels */
export function getImportSources(): { id: ImportSource; label: string }[] {
  return [
    { id: 'auto', label: 'Auto-detect' },
    { id: 'chrome', label: 'Chrome / Edge' },
    { id: 'bitwarden', label: 'Bitwarden' },
    { id: 'lastpass', label: 'LastPass' },
    { id: '1password', label: '1Password' },
    { id: 'keepass', label: 'KeePass' },
  ];
}
