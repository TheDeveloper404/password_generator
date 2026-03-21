import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, RefreshCw, Sun, Moon, Star, Trash2, Globe, KeyRound, Shield, Zap, Wifi, LogOut, Hash, Brain, Music, Map } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  generatePassphrase,
  generatePassword,
  GeneratorMode,
  PASSWORD_PRESETS,
  PassphraseOptions,
  PasswordCharacterOptions,
} from '../utils/passwordUtils';
import { calculateStrength } from '../utils/strengthUtils';
import { DEFAULT_POLICY, evaluatePolicy } from '../utils/policyUtils';
import { useTranslation } from '../contexts/LanguageContext';
import StrengthIndicator from './StrengthIndicator';
import PasswordOptions from './PasswordOptions';
import PolicyIndicator from './PolicyIndicator';
import UsernameGenerator from './UsernameGenerator';
import PasswordHealthCheck from './PasswordHealthCheck';
import SecurityTips from './SecurityTips';
import WiFiQrCode from './WiFiQrCode';
import HashGenerator from './HashGenerator';
import PasswordAnalyzer from './PasswordAnalyzer';
import AudioPassphrase from './AudioPassphrase';
import PasswordMap from './PasswordMap';
import CloudSyncIndicator, { OfflineIndicator } from './auth/CloudSyncIndicator';
import VaultView from './vault/VaultView';
import HealthDashboard from './vault/HealthDashboard';
import MasterPasswordSetup from './auth/MasterPasswordSetup';
import UnlockScreen from './auth/UnlockScreen';
import type { VaultData, VaultEntry, MainTab } from '../types/vault';

const STORAGE_KEYS = {
  privacyMode: 'pg_privacy_mode',
  mode: 'pg_mode',
  minEntropy: 'pg_min_entropy',
  length: 'pg_length',
  options: 'pg_options',
  passphraseOptions: 'pg_passphrase_options',
  copiedHistory: 'pg_copied_history',
  favorites: 'pg_favorites',
};

const DEFAULT_OPTIONS: PasswordCharacterOptions = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: 4,
  separator: '-',
  capitalize: true,
  includeNumber: true,
};

function getStoredValue<T>(key: string, fallback: T): T {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

interface PasswordGeneratorProps {
  vault: VaultData | null;
  vaultConfigured: boolean;
  masterPassword: string;
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  cloudUser: User | null;
  onCloudLogout: () => void;
  onVaultDownloaded: (vault: VaultData) => void;
  onAddEntry: (entry: Partial<VaultEntry>) => void;
  onUpdateEntry: (id: string, updates: Partial<VaultEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddFolder: (name: string) => void;
  onExport: () => void;
  onImport: () => void;
  onLock: () => void;
  onSetup: (password: string) => Promise<void>;
  onUnlock: (password: string) => Promise<boolean>;
  onReset: () => void;
  onLogout: () => void;
}

export default function PasswordGenerator({
  vault,
  vaultConfigured,
  masterPassword: masterPw,
  darkMode,
  setDarkMode,
  cloudUser,
  onCloudLogout,
  onVaultDownloaded,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onToggleFavorite,
  onAddFolder,
  onExport,
  onImport,
  onLock,
  onSetup,
  onUnlock,
  onReset,
  onLogout,
}: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<GeneratorMode>(() =>
    getStoredValue<GeneratorMode>(STORAGE_KEYS.mode, 'password')
  );
  const [minEntropy, setMinEntropy] = useState(() => getStoredValue<number>(STORAGE_KEYS.minEntropy, 60));
  const [length, setLength] = useState(() => getStoredValue<number>(STORAGE_KEYS.length, 12));
  const [options, setOptions] = useState<PasswordCharacterOptions>(() =>
    getStoredValue<PasswordCharacterOptions>(STORAGE_KEYS.options, DEFAULT_OPTIONS)
  );
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>(() =>
    getStoredValue<PassphraseOptions>(STORAGE_KEYS.passphraseOptions, DEFAULT_PASSPHRASE_OPTIONS)
  );
  const [privacyMode, setPrivacyMode] = useState(() =>
    getStoredValue<boolean>(STORAGE_KEYS.privacyMode, false)
  );
  const [copiedHistory, setCopiedHistory] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.copiedHistory, [])
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.favorites, [])
  );
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTabRaw] = useState<MainTab>(() => {
    const saved = sessionStorage.getItem('passgen_active_tab');
    const valid: MainTab[] = ['generator', 'wifi', 'hash', 'analyzer', 'audio', 'map', 'vault', 'health'];
    return saved && valid.includes(saved as MainTab) ? (saved as MainTab) : 'generator';
  });
  const setActiveTab = (tab: MainTab) => {
    sessionStorage.setItem('passgen_active_tab', tab);
    setActiveTabRaw(tab);
  };

  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mode, JSON.stringify(mode));
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.privacyMode, JSON.stringify(privacyMode));
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.minEntropy, JSON.stringify(minEntropy));
  }, [minEntropy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.length, JSON.stringify(length));
  }, [length]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.options, JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.passphraseOptions, JSON.stringify(passphraseOptions));
  }, [passphraseOptions]);

  useEffect(() => {
    if (privacyMode) {
      localStorage.removeItem(STORAGE_KEYS.copiedHistory);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.copiedHistory, JSON.stringify(copiedHistory));
  }, [copiedHistory, privacyMode]);

  useEffect(() => {
    if (privacyMode) {
      localStorage.removeItem(STORAGE_KEYS.favorites);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites, privacyMode]);

  useEffect(() => {
    if (!privacyMode) {
      return;
    }

    setCopiedHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEYS.copiedHistory);
    localStorage.removeItem(STORAGE_KEYS.favorites);
  }, [privacyMode]);

  const handleGenerate = useCallback(() => {
    const generatorStrengthOptions =
      mode === 'password'
        ? options
        : {
            uppercase: passphraseOptions.capitalize,
            lowercase: true,
            numbers: passphraseOptions.includeNumber,
            symbols: true,
          };

    let bestCandidate = '';
    let bestEntropy = -1;
    let selectedOutput = '';

    for (let attempt = 0; attempt < 64; attempt++) {
      const candidate =
        mode === 'password' ? generatePassword(length, options) : generatePassphrase(passphraseOptions);
      const candidateStrength = calculateStrength(candidate, generatorStrengthOptions);

      if (candidateStrength.entropy > bestEntropy) {
        bestCandidate = candidate;
        bestEntropy = candidateStrength.entropy;
      }

      if (candidateStrength.entropy >= minEntropy) {
        selectedOutput = candidate;
        break;
      }
    }

    const newPassword = selectedOutput || bestCandidate;

    setPassword(newPassword);
    setCopied(false);
  }, [length, minEntropy, mode, options, passphraseOptions]);

  const handleCopy = useCallback(async (value = password) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedHistory((previous) => [value, ...previous.filter((item) => item !== value)].slice(0, 30));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const handleApplyPreset = (presetId: string) => {
    const preset = PASSWORD_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setMode(preset.mode);

    if (preset.mode === 'password') {
      if (preset.length) {
        setLength(preset.length);
      }

      if (preset.options) {
        setOptions(preset.options);
      }
    }

    if (preset.mode === 'passphrase' && preset.passphraseOptions) {
      setPassphraseOptions(preset.passphraseOptions);
    }
  };

  const toggleFavorite = (value: string) => {
    setFavorites((previous) =>
      previous.includes(value) ? previous.filter((item) => item !== value) : [value, ...previous].slice(0, 20)
    );
  };

  const removeFromCopiedHistory = (value: string) => {
    setCopiedHistory((previous) => previous.filter((item) => item !== value));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingInField =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';

      if (isTypingInField) {
        return;
      }

      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        handleGenerate();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && password) {
        event.preventDefault();
        void handleCopy(password);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCopy, handleGenerate, password]);

  const strengthInputOptions = useMemo(
    () =>
      mode === 'password'
        ? options
        : {
            uppercase: passphraseOptions.capitalize,
            lowercase: true,
            numbers: passphraseOptions.includeNumber,
            symbols: true,
          },
    [mode, options, passphraseOptions]
  );

  const strength = calculateStrength(password, strengthInputOptions, t);
  const policyResult = useMemo(() => evaluatePolicy(password, DEFAULT_POLICY, t), [password, t]);

  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="mx-auto max-w-[1680px] px-4 py-3 lg:h-[calc(100%-4px)] lg:px-6 lg:py-4 lg:flex lg:flex-col">

        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Shield size={18} className="text-white" />
            </div>
            <h1 className={`text-lg lg:text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.appTitle}
            </h1>

            {/* Tab navigation */}
            <nav className={`hidden sm:flex items-center ml-4 gap-1 p-1 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
              {([
                { id: 'generator' as MainTab, icon: Zap, label: t.tabGenerator },
                { id: 'wifi' as MainTab, icon: Wifi, label: t.tabWifi },
                { id: 'hash' as MainTab, icon: Hash, label: t.tabHash },
                { id: 'analyzer' as MainTab, icon: Brain, label: t.tabAnalyzer },
                { id: 'audio' as MainTab, icon: Music, label: t.tabAudio },
                { id: 'map' as MainTab, icon: Map, label: t.tabMap },
                { id: 'vault' as MainTab, icon: KeyRound, label: t.tabVault },
                { id: 'health' as MainTab, icon: Shield, label: t.tabHealth },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                      : darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <label className={`hidden sm:flex items-center gap-1.5 text-xs cursor-pointer select-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={() => setPrivacyMode((current) => !current)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {t.privacyMode}
            </label>
            <div className={`h-5 w-px mx-1 hidden sm:block ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <button
              onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title={lang === 'ro' ? t.switchToEn : t.switchToRo}
            >
              <Globe size={14} />
              {lang === 'ro' ? 'EN' : 'RO'}
            </button>
            <button
              onClick={() => setDarkMode((current: boolean) => !current)}
              className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className={`h-5 w-px mx-0.5 hidden sm:block ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <CloudSyncIndicator
              darkMode={darkMode}
              vault={vault}
              masterPassword={masterPw}
              cloudUser={cloudUser}
              onVaultDownloaded={onVaultDownloaded}
              onCloudLogout={onCloudLogout}
            />
            <OfflineIndicator darkMode={darkMode} />
            <button
              onClick={() => { sessionStorage.removeItem('passgen_active_tab'); onLogout(); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'}`}
              title={t.logout}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">{t.logout}</span>
            </button>
          </div>
        </header>

        {/* Mobile tab navigation */}
        <nav className={`flex sm:hidden items-center gap-0.5 p-1 rounded-xl mb-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          {([
            { id: 'generator' as MainTab, icon: Zap, label: t.tabGenerator },
            { id: 'wifi' as MainTab, icon: Wifi, label: t.tabWifi },
            { id: 'hash' as MainTab, icon: Hash, label: t.tabHash },
            { id: 'analyzer' as MainTab, icon: Brain, label: t.tabAnalyzer },
            { id: 'audio' as MainTab, icon: Music, label: t.tabAudio },
            { id: 'map' as MainTab, icon: Map, label: t.tabMap },
            { id: 'vault' as MainTab, icon: KeyRound, label: t.tabVault },
            { id: 'health' as MainTab, icon: Shield, label: t.tabHealth },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-all min-w-0 ${
                activeTab === tab.id
                  ? 'flex-[1.6] px-2.5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                  : `flex-1 px-1.5 py-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              <tab.icon size={14} className="shrink-0" />
              {activeTab === tab.id && (
                <span className="truncate">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {activeTab === 'generator' && (
          <div className="lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
        {/* Password output bar */}
        <div className={`relative flex items-center rounded-xl mb-3 max-w-4xl mx-auto w-full transition-all ${darkMode ? 'bg-gray-800/80 border border-gray-700/60 shadow-lg shadow-black/20' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex-1 px-5 py-2.5">
            <input
              type="text"
              value={password}
              readOnly
              className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-lg font-mono tracking-wider ${darkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-300'}`}
              placeholder={mode === 'password' ? t.placeholderPassword : t.placeholderPassphrase}
            />
          </div>
          <div className="flex items-center gap-1 pr-3">
            <span className={`text-xs mr-2 ${copied ? 'text-emerald-400 font-medium' : 'hidden'}`}>
              {t.copiedToClipboard}
            </span>
            <button
              onClick={() => void handleCopy()}
              className={`p-2.5 rounded-lg transition-all ${copied ? 'text-emerald-400 bg-emerald-500/10' : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              title={t.copyToClipboard}
            >
              <Copy size={16} />
            </button>
            <button
              onClick={handleGenerate}
              className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
              title={t.generateNew}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Main 3-column grid */}
        <div className="grid gap-3 lg:grid-cols-3 lg:flex-1 lg:min-h-0">

          {/* Column 1: Options + Strength + Generate */}
          <div className="flex flex-col gap-3 lg:overflow-y-auto lg:max-h-full">
            <div className={`rounded-2xl p-4 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <PasswordOptions
                mode={mode}
                setMode={setMode}
                minEntropy={minEntropy}
                setMinEntropy={setMinEntropy}
                length={length}
                setLength={setLength}
                options={options}
                setOptions={setOptions}
                passphraseOptions={passphraseOptions}
                setPassphraseOptions={setPassphraseOptions}
                presets={PASSWORD_PRESETS}
                onApplyPreset={handleApplyPreset}
                darkMode={darkMode}
              />
            </div>

            {/* Strength & Policy card */}
            <div className={`rounded-2xl p-4 space-y-3 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <StrengthIndicator strength={strength} darkMode={darkMode} />
              <div className="text-xs">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${strength.entropy >= minEntropy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {t.minEntropyTarget}: {minEntropy} {t.bits} {strength.entropy >= minEntropy ? '✓' : `(${strength.entropy} ${t.bits})`}
                </span>
              </div>
              <PolicyIndicator result={policyResult} darkMode={darkMode} />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              {mode === 'password' ? t.generatePassword : t.generatePassphrase}
            </button>
          </div>

          {/* Column 2: History */}
          <div className={`rounded-2xl p-4 lg:overflow-y-auto lg:max-h-full lg:flex-1 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
            {copiedHistory.length === 0 && favorites.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-10 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Star size={28} className="mb-2 opacity-30" />
                <p className="text-sm">{t.historyEmpty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {copiedHistory.length > 0 && (
                  <div className="space-y-2">
                    <h2 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.historyCopied}
                    </h2>
                    <div className="space-y-1">
                      {copiedHistory.map((item) => (
                        <div
                          key={`copied-${item}`}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
                            darkMode ? 'hover:bg-gray-700/50 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <button className="truncate text-left font-mono text-xs" onClick={() => setPassword(item)}>
                            {item}
                          </button>
                          <div className="ml-2 flex items-center gap-0.5">
                            <button
                              className={`p-1 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              onClick={() => void handleCopy(item)}
                              title={t.copyAgain}
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              className={`p-1 rounded-md text-red-400 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              onClick={() => removeFromCopiedHistory(item)}
                              title={t.removeFromCopied}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {favorites.length > 0 && (
                  <div className="space-y-2">
                    <h2 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t.historyFavorites}
                    </h2>
                    <div className="space-y-1">
                      {favorites.map((item) => (
                        <div
                          key={`fav-${item}`}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 transition-all ${
                            darkMode ? 'hover:bg-gray-700/50 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <button className="truncate text-left font-mono text-xs" onClick={() => setPassword(item)}>
                            {item}
                          </button>
                          <div className="ml-2 flex items-center gap-0.5">
                            <button
                              className={`p-1 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              onClick={() => void handleCopy(item)}
                              title={t.copy}
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              className={`p-1 rounded-md text-amber-400 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                              onClick={() => toggleFavorite(item)}
                              title={t.removeFavorite}
                            >
                              <Star size={12} fill="currentColor" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 3: Tools */}
          <div className="flex flex-col gap-3 lg:overflow-y-auto lg:max-h-full">
            {/* Username Generator card */}
            <div className={`rounded-2xl p-4 flex-1 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <UsernameGenerator darkMode={darkMode} />
            </div>

            {/* Password Health Check card */}
            <div className={`rounded-2xl p-4 flex-1 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <PasswordHealthCheck darkMode={darkMode} generatedPassword={password} />
            </div>

            {/* Security Tips card */}
            <div className={`rounded-2xl p-4 flex-1 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <SecurityTips darkMode={darkMode} />
            </div>
          </div>
        </div>
          </div>
        )}

        {/* WiFi QR Tab */}
        {activeTab === 'wifi' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className={`rounded-2xl lg:h-full overflow-hidden transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <div className="lg:grid lg:grid-cols-2 lg:h-full">
                <div className="p-6 lg:p-8 lg:overflow-y-auto">
                  <WiFiQrCode darkMode={darkMode} generatedPassword={password} />
                </div>
                <div className={`hidden lg:flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-cyan-950/40 via-gray-900/60 to-blue-950/40' : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100'}`}>
                  {/* Radiating rings */}
                  <div className={`absolute rounded-full w-40 h-40 border ${darkMode ? 'border-cyan-400/[0.06]' : 'border-cyan-400/[0.1]'} animate-ping`} style={{ animationDuration: '3s' }} />
                  <div className={`absolute rounded-full w-64 h-64 border ${darkMode ? 'border-cyan-400/[0.04]' : 'border-cyan-400/[0.07]'} animate-ping`} style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
                  <div className={`absolute rounded-full w-96 h-96 border ${darkMode ? 'border-cyan-400/[0.03]' : 'border-cyan-400/[0.05]'} animate-ping`} style={{ animationDuration: '5s', animationDelay: '1s' }} />
                  <Wifi size={180} strokeWidth={0.8} className={`anim-float ${darkMode ? 'text-cyan-400/[0.07]' : 'text-cyan-400/[0.12]'}`} />
                  <div className={`absolute bottom-8 left-8 right-8 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    <p className="text-xs font-medium">WPA / WPA2 / WPA3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hash Generator Tab */}
        {activeTab === 'hash' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className={`rounded-2xl lg:h-full overflow-hidden transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <div className="lg:grid lg:grid-cols-5 lg:h-full">
                <div className="lg:col-span-3 p-6 lg:p-8 lg:overflow-y-auto">
                  <HashGenerator darkMode={darkMode} />
                </div>
                <div className={`lg:col-span-2 hidden lg:flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-purple-950/40 via-gray-900/60 to-indigo-950/40' : 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100'}`}>
                  {/* Orbiting dots */}
                  <div className={`absolute w-48 h-48 rounded-full border border-dashed ${darkMode ? 'border-purple-400/[0.08]' : 'border-purple-400/[0.12]'} anim-spin-slow`} />
                  <div className={`absolute w-72 h-72 rounded-full border border-dashed ${darkMode ? 'border-indigo-400/[0.05]' : 'border-indigo-400/[0.08]'} anim-spin-slow`} style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
                  <Hash size={180} strokeWidth={0.8} className={`anim-pulse ${darkMode ? 'text-purple-400/[0.07]' : 'text-purple-400/[0.12]'}`} />
                  <div className={`absolute bottom-8 left-8 right-8 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    <p className="text-xs font-medium">MD5 · SHA-1 · SHA-256 · SHA-512</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className={`rounded-2xl lg:h-full overflow-hidden transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <div className="lg:grid lg:grid-cols-5 lg:h-full">
                <div className="lg:col-span-3 p-6 lg:p-8 lg:overflow-y-auto">
                  <PasswordAnalyzer darkMode={darkMode} generatedPassword={password} />
                </div>
                <div className={`lg:col-span-2 hidden lg:flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-fuchsia-950/40 via-gray-900/60 to-pink-950/40' : 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-100'}`}>
                  {/* Scanning line */}
                  <div className={`absolute inset-x-0 h-px ${darkMode ? 'bg-gradient-to-r from-transparent via-fuchsia-400/20 to-transparent' : 'bg-gradient-to-r from-transparent via-fuchsia-400/30 to-transparent'}`} style={{ animation: 'decorFloat 4s ease-in-out infinite' }} />
                  <div className={`absolute w-56 h-56 rounded-full ${darkMode ? 'bg-fuchsia-500/[0.03]' : 'bg-fuchsia-500/[0.05]'} anim-pulse`} />
                  <Brain size={180} strokeWidth={0.8} className={`anim-pulse ${darkMode ? 'text-fuchsia-400/[0.07]' : 'text-fuchsia-400/[0.12]'}`} style={{ animationDelay: '0.5s' }} />
                  <div className={`absolute bottom-8 left-8 right-8 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    <p className="text-xs font-medium">AI · Shannon Entropy · 10 Vulnerability Checks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Passphrase Tab */}
        {activeTab === 'audio' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className={`rounded-2xl lg:h-full overflow-hidden transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
              <div className="lg:grid lg:grid-cols-2 lg:h-full">
                <div className="p-6 lg:p-8 lg:overflow-y-auto">
                  <AudioPassphrase darkMode={darkMode} generatedPassword={password} />
                </div>
                <div className={`hidden lg:flex items-center justify-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-pink-950/40 via-gray-900/60 to-rose-950/40' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-orange-100'}`}>
                  {/* Sound wave bars */}
                  <div className="absolute flex items-center gap-1.5">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full ${darkMode ? 'bg-pink-400/[0.08]' : 'bg-pink-400/[0.12]'}`}
                        style={{
                          height: `${20 + Math.sin(i * 0.8) * 40 + 30}px`,
                          animation: 'decorFloat 3s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <Music size={180} strokeWidth={0.8} className={`anim-float-slow ${darkMode ? 'text-pink-400/[0.07]' : 'text-pink-400/[0.12]'}`} />
                  <div className={`absolute bottom-8 left-8 right-8 text-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    <p className="text-xs font-medium">Pentatonic · Major · Chromatic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Map Tab */}
        {activeTab === 'map' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            {vault ? (
              <div className={`rounded-2xl p-5 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
                <PasswordMap darkMode={darkMode} vault={vault} />
              </div>
            ) : vaultConfigured ? (
              <UnlockScreen
                darkMode={darkMode}
                onUnlock={onUnlock}
                onReset={onReset}
                inline
              />
            ) : (
              <MasterPasswordSetup
                darkMode={darkMode}
                onSetup={onSetup}
                inline
              />
            )}
          </div>
        )}

        {/* Vault Tab */}
        {activeTab === 'vault' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            {vault ? (
              <div className={`rounded-2xl p-5 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
                <VaultView
                  darkMode={darkMode}
                  vault={vault}
                  onAddEntry={onAddEntry}
                  onUpdateEntry={onUpdateEntry}
                  onDeleteEntry={onDeleteEntry}
                  onToggleFavorite={onToggleFavorite}
                  onAddFolder={onAddFolder}
                  onExport={onExport}
                  onImport={onImport}
                  onLock={onLock}
                  masterPassword={masterPw}
                />
              </div>
            ) : vaultConfigured ? (
              <UnlockScreen
                darkMode={darkMode}
                onUnlock={onUnlock}
                onReset={onReset}
                inline
              />
            ) : (
              <MasterPasswordSetup
                darkMode={darkMode}
                onSetup={onSetup}
                inline
              />
            )}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            {vault ? (
              <div className={`rounded-2xl p-5 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
                <HealthDashboard darkMode={darkMode} vault={vault} />
              </div>
            ) : vaultConfigured ? (
              <UnlockScreen
                darkMode={darkMode}
                onUnlock={onUnlock}
                onReset={onReset}
                inline
              />
            ) : (
              <MasterPasswordSetup
                darkMode={darkMode}
                onSetup={onSetup}
                inline
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
