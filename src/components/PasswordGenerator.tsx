import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, RefreshCw, Sun, Moon, Star, Trash2, Globe, KeyRound, Shield, Zap, Wifi, LogOut } from 'lucide-react';
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
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
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
  darkMode,
  setDarkMode,
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
  const [activeTab, setActiveTab] = useState<MainTab>('generator');

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
            <button
              onClick={onLogout}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${darkMode ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'}`}
              title={t.logout}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">{t.logout}</span>
            </button>
          </div>
        </header>

        {/* Mobile tab navigation */}
        <nav className={`flex sm:hidden items-center gap-1 p-1 rounded-xl mb-4 ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          {([
            { id: 'generator' as MainTab, icon: Zap, label: t.tabGenerator },
            { id: 'wifi' as MainTab, icon: Wifi, label: t.tabWifi },
            { id: 'vault' as MainTab, icon: KeyRound, label: t.tabVault },
            { id: 'health' as MainTab, icon: Shield, label: t.tabHealth },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {activeTab === 'generator' && (
          <div className="lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
        {/* Password output bar */}
        <div className={`relative flex items-center rounded-xl mb-4 transition-all ${darkMode ? 'bg-gray-800/80 border border-gray-700/60 shadow-lg shadow-black/20' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex-1 px-5 py-3.5">
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
        <div className="grid gap-4 lg:grid-cols-3 lg:flex-1 lg:min-h-0">

          {/* Column 1: Options + Strength + Generate */}
          <div className="flex flex-col gap-4 lg:overflow-y-auto lg:max-h-full">
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

          {/* Column 2: Username Generator + Health Check */}
          <div className="flex flex-col gap-4 lg:overflow-y-auto lg:max-h-full">
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

          {/* Column 3: History */}
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
        </div>
          </div>
        )}

        {/* WiFi QR Tab */}
        {activeTab === 'wifi' && (
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
            <div className="max-w-lg mx-auto">
              <div className={`rounded-2xl p-6 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
                <WiFiQrCode darkMode={darkMode} generatedPassword={password} />
              </div>
            </div>
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
