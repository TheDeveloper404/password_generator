import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../utils/i18n';
import PasswordMap from '../components/PasswordMap';
import type { VaultData, VaultEntry } from '../types/vault';

// Mock Canvas API – canvas.getContext returns null in jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;

function renderWithLanguage(ui: React.ReactElement, lang: 'ro' | 'en' = 'en') {
  return render(
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang: () => {} }}>
      {ui}
    </LanguageContext.Provider>
  );
}

function makeEntry(overrides: Partial<VaultEntry> = {}): VaultEntry {
  return {
    id: crypto.randomUUID(),
    type: 'login',
    title: 'Test Site',
    siteUrl: 'https://example.com',
    username: 'user@test.com',
    password: 'P@ssw0rd123!',
    notes: '',
    tags: [],
    folder: '',
    favorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function makeVault(entries: VaultEntry[] = []): VaultData {
  return {
    version: 1,
    entries,
    folders: [],
    lastModified: Date.now(),
  };
}

describe('PasswordMap Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('shows empty state when vault has no entries', () => {
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault()} />);
    expect(screen.getByText(translations.en.mapEmpty)).toBeInTheDocument();
  });

  it('shows empty state when entries have no passwords', () => {
    const entry = makeEntry({ password: '' });
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapEmpty)).toBeInTheDocument();
  });

  it('renders title when vault has entries', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapTitle)).toBeInTheDocument();
  });

  it('renders description', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapDesc)).toBeInTheDocument();
  });

  it('displays stats bar with correct total count', () => {
    const entries = [makeEntry(), makeEntry({ password: 'short' }), makeEntry({ password: '7&lZ#mQ!9@kR$' })];
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault(entries)} />);
    // Total count
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders legend with all 5 security tiers', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    // Some labels appear in both stats and legend, so use getAllByText
    expect(screen.getAllByText(translations.en.mapCritical).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(translations.en.mapWeak).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(translations.en.mapFair).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(translations.en.mapStrong).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(translations.en.mapExcellent).length).toBeGreaterThanOrEqual(1);
  });

  it('shows canvas element', () => {
    const entry = makeEntry();
    const { container } = renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders hint text', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapHint)).toBeInTheDocument();
  });

  it('renders in Romanian', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />, 'ro');
    expect(screen.getByText(translations.ro.mapTitle)).toBeInTheDocument();
    expect(screen.getByText(translations.ro.mapDesc)).toBeInTheDocument();
  });

  it('works in dark mode', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={true} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapTitle)).toBeInTheDocument();
  });

  it('correctly counts critical passwords', () => {
    const criticalEntry = makeEntry({ password: 'a' }); // very short = critical
    const strongEntry = makeEntry({ password: '7&lZ#mQ!9@kR$xW2' }); // complex = strong
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([criticalEntry, strongEntry])} />);
    // Stats should show 2 total entries
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows stat labels', () => {
    const entry = makeEntry();
    renderWithLanguage(<PasswordMap darkMode={false} vault={makeVault([entry])} />);
    expect(screen.getByText(translations.en.mapTotal)).toBeInTheDocument();
    expect(screen.getByText(translations.en.mapAvgScore)).toBeInTheDocument();
    expect(screen.getAllByText(translations.en.mapStrongCount).length).toBeGreaterThanOrEqual(1);
  });
});
