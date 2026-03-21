import React from 'react';
import {
  GeneratorMode,
  GeneratorPreset,
  PassphraseOptions,
  PasswordCharacterOptions,
} from '../utils/passwordUtils';
import { useTranslation } from '../contexts/LanguageContext';

interface PasswordOptionsProps {
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;
  minEntropy: number;
  setMinEntropy: (value: number) => void;
  length: number;
  setLength: (length: number) => void;
  options: PasswordCharacterOptions;
  setOptions: (options: PasswordCharacterOptions) => void;
  passphraseOptions: PassphraseOptions;
  setPassphraseOptions: (options: PassphraseOptions) => void;
  presets: GeneratorPreset[];
  onApplyPreset: (presetId: string) => void;
  darkMode: boolean;
}

const PRESET_LABEL_KEYS: Record<string, keyof ReturnType<typeof import('../contexts/LanguageContext').useTranslation>['t']> = {
  wifi: 'presetWifi',
  bank: 'presetBank',
  social: 'presetSocial',
  pin: 'presetPin',
  memorable: 'presetMemorable',
};

export default function PasswordOptions({
  mode,
  setMode,
  minEntropy,
  setMinEntropy,
  length,
  setLength,
  options,
  setOptions,
  passphraseOptions,
  setPassphraseOptions,
  presets,
  onApplyPreset,
  darkMode,
}: PasswordOptionsProps) {
  const { t } = useTranslation();

  const handleOptionChange = (key: keyof typeof options) => {
    setOptions({ ...options, [key]: !options[key] });
  };

  const handlePassphraseOptionChange = <K extends keyof PassphraseOptions>(
    key: K,
    value: PassphraseOptions[K]
  ) => {
    setPassphraseOptions({ ...passphraseOptions, [key]: value });
  };

  const getPresetLabel = (preset: GeneratorPreset) => {
    const key = PRESET_LABEL_KEYS[preset.id];
    return key ? (t[key] as string) : preset.label;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.mode}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              mode === 'password'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                : darkMode
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.password}
          </button>
          <button
            type="button"
            onClick={() => setMode('passphrase')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              mode === 'passphrase'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                : darkMode
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.passphrase}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.quickPresets}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                darkMode
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
              }`}
            >
              {getPresetLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.minEntropyTarget}
          </label>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-100'}`}>{minEntropy} bits</span>
        </div>
        <input
          type="range"
          min="30"
          max="110"
          step="2"
          value={minEntropy}
          onChange={(event) => setMinEntropy(parseInt(event.target.value, 10))}
          className="w-full"
        />
      </div>

      {mode === 'password' ? (
        <>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.passwordLength}
              </label>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-100'}`}>{length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.passwordOptions}
            </label>
            <div className="space-y-2">
              {[
                { key: 'uppercase', label: t.includeUppercase },
                { key: 'lowercase', label: t.includeLowercase },
                { key: 'numbers', label: t.includeNumbers },
                { key: 'symbols', label: t.includeSymbols },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={options[key as keyof typeof options]}
                    onChange={() => handleOptionChange(key as keyof typeof options)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={key}
                    className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.wordCount}
              </label>
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-100'}`}>
                {passphraseOptions.wordCount}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              value={passphraseOptions.wordCount}
              onChange={(event) =>
                handlePassphraseOptionChange('wordCount', parseInt(event.target.value, 10))
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.separator}
            </label>
            <select
              value={passphraseOptions.separator}
              onChange={(event) =>
                handlePassphraseOptionChange(
                  'separator',
                  event.target.value as PassphraseOptions['separator']
                )
              }
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                darkMode
                  ? 'bg-gray-700/50 border-gray-600 text-gray-100'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <option value="-">{t.separatorDash}</option>
              <option value="_">{t.separatorUnderscore}</option>
              <option value=".">{t.separatorDot}</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="capitalize"
                checked={passphraseOptions.capitalize}
                onChange={() =>
                  handlePassphraseOptionChange('capitalize', !passphraseOptions.capitalize)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="capitalize"
                className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t.capitalizeWords}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeNumber"
                checked={passphraseOptions.includeNumber}
                onChange={() =>
                  handlePassphraseOptionChange('includeNumber', !passphraseOptions.includeNumber)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="includeNumber"
                className={`ml-2 block text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
              >
                {t.appendRandomNumber}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
