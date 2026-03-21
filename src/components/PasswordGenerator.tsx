import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, RefreshCw, Sun, Moon, Star, Trash2 } from 'lucide-react';
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
import StrengthIndicator from './StrengthIndicator';
import PasswordOptions from './PasswordOptions';
import PolicyIndicator from './PolicyIndicator';

const STORAGE_KEYS = {
  darkMode: 'pg_dark_mode',
  privacyMode: 'pg_privacy_mode',
  mode: 'pg_mode',
  minEntropy: 'pg_min_entropy',
  length: 'pg_length',
  options: 'pg_options',
  passphraseOptions: 'pg_passphrase_options',
  history: 'pg_history',
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

export default function PasswordGenerator() {
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
  const [darkMode, setDarkMode] = useState(() => getStoredValue<boolean>(STORAGE_KEYS.darkMode, false));
  const [privacyMode, setPrivacyMode] = useState(() =>
    getStoredValue<boolean>(STORAGE_KEYS.privacyMode, false)
  );
  const [history, setHistory] = useState<string[]>(() => getStoredValue<string[]>(STORAGE_KEYS.history, []));
  const [copiedHistory, setCopiedHistory] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.copiedHistory, [])
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.favorites, [])
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(darkMode));
  }, [darkMode]);

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
      localStorage.removeItem(STORAGE_KEYS.history);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  }, [history, privacyMode]);

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

    setHistory([]);
    setCopiedHistory([]);
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEYS.history);
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
    setHistory((previous) => [newPassword, ...previous.filter((item) => item !== newPassword)].slice(0, 10));
    setCopied(false);
  }, [length, minEntropy, mode, options, passphraseOptions]);

  const handleCopy = useCallback(async (value = password) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedHistory((previous) => [value, ...previous.filter((item) => item !== value)].slice(0, 15));
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

  const removeFromHistory = (value: string) => {
    setHistory((previous) => previous.filter((item) => item !== value));
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

  const strength = calculateStrength(password, strengthInputOptions);
  const policyResult = useMemo(() => evaluatePolicy(password, DEFAULT_POLICY), [password]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 space-y-5`}>
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Password Generator
            </h1>
            <button
              onClick={() => setDarkMode((current) => !current)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun className="text-white" /> : <Moon className="text-gray-900" />}
            </button>
          </div>

          <div className={`relative flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <input
              type="text"
              value={password}
              readOnly
              className={`w-full pr-20 bg-transparent border-none focus:ring-0 text-lg ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              placeholder={
                mode === 'password' ? 'Click generate to create password' : 'Click generate to create passphrase'
              }
            />
            <div className="absolute right-4 flex space-x-2">
              <button
                onClick={() => void handleCopy()}
                className={`p-2 rounded-md transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                } ${copied ? 'text-green-500' : darkMode ? 'text-white' : 'text-gray-600'}`}
                title="Copy to clipboard"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={handleGenerate}
                className={`p-2 rounded-md transition-colors ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                } ${darkMode ? 'text-white' : 'text-gray-600'}`}
                title="Generate new password"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className={`${copied ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {copied ? 'Copied to clipboard!' : 'Shortcut: Space generate · Ctrl/Cmd+C copy'}
            </span>
            <label className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={() => setPrivacyMode((current) => !current)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
              />
              Privacy mode
            </label>
          </div>

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

          <StrengthIndicator strength={strength} darkMode={darkMode} />
          <div className="-mt-3 text-xs">
            <span className={`${strength.entropy >= minEntropy ? 'text-green-500' : 'text-amber-500'}`}>
              Entropy target: {minEntropy} bits {strength.entropy >= minEntropy ? '✓' : `(${strength.entropy} bits)`}
            </span>
          </div>
          <PolicyIndicator result={policyResult} darkMode={darkMode} />

          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {mode === 'password' ? 'Generate Password' : 'Generate Passphrase'}
          </button>

          {(history.length > 0 || favorites.length > 0 || copiedHistory.length > 0) && (
            <div className="space-y-4 pt-2">
              {copiedHistory.length > 0 && (
                <div className="space-y-2">
                  <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Istoric copiate
                  </h2>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {copiedHistory.map((item) => (
                      <div
                        key={`copied-${item}`}
                        className={`rounded-md px-3 py-2 text-sm flex items-center justify-between ${
                          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <button className="truncate text-left" onClick={() => setPassword(item)}>
                          {item}
                        </button>
                        <div className="ml-2 flex items-center gap-1">
                          <button
                            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            onClick={() => void handleCopy(item)}
                            title="Copy again"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className={`p-1 rounded text-red-500 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            onClick={() => removeFromCopiedHistory(item)}
                            title="Remove from copied history"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="space-y-2">
                  <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Favorite
                  </h2>
                  <div className="space-y-2 max-h-28 overflow-y-auto">
                    {favorites.slice(0, 5).map((item) => (
                      <div
                        key={`fav-${item}`}
                        className={`rounded-md px-3 py-2 text-sm flex items-center justify-between ${
                          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <button className="truncate text-left" onClick={() => setPassword(item)}>
                          {item}
                        </button>
                        <div className="ml-2 flex items-center gap-1">
                          <button
                            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            onClick={() => void handleCopy(item)}
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className={`p-1 rounded text-yellow-500 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            onClick={() => toggleFavorite(item)}
                            title="Remove favorite"
                          >
                            <Star size={14} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div className="space-y-2">
                  <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Istoric recent
                  </h2>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {history.map((item) => (
                      <div
                        key={`history-${item}`}
                        className={`rounded-md px-3 py-2 text-sm flex items-center justify-between ${
                          darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <button className="truncate text-left" onClick={() => setPassword(item)}>
                          {item}
                        </button>
                        <div className="ml-2 flex items-center gap-1">
                          <button
                            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            onClick={() => void handleCopy(item)}
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className={`p-1 rounded ${
                              favorites.includes(item)
                                ? 'text-yellow-500'
                                : darkMode
                                  ? 'text-gray-300'
                                  : 'text-gray-500'
                            } ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                            onClick={() => toggleFavorite(item)}
                            title="Toggle favorite"
                          >
                            <Star size={14} fill={favorites.includes(item) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            className={`p-1 rounded text-red-500 ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            onClick={() => removeFromHistory(item)}
                            title="Remove from history"
                          >
                            <Trash2 size={14} />
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
  );
}