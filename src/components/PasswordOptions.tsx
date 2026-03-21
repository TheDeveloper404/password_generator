import React from 'react';
import {
  GeneratorMode,
  GeneratorPreset,
  PassphraseOptions,
  PasswordCharacterOptions,
} from '../utils/passwordUtils';

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
  const handleOptionChange = (key: keyof typeof options) => {
    setOptions({ ...options, [key]: !options[key] });
  };

  const handlePassphraseOptionChange = <K extends keyof PassphraseOptions>(
    key: K,
    value: PassphraseOptions[K]
  ) => {
    setPassphraseOptions({ ...passphraseOptions, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className={`block font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'password'
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode('passphrase')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'passphrase'
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Passphrase
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          Preset-uri rapide
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Entropy minimă țintă
          </label>
          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{minEntropy} bits</span>
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
              <label className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Password Length
              </label>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{length}</span>
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
            <label className={`block font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Password Options
            </label>
            <div className="space-y-2">
              {[
                { key: 'uppercase', label: 'Include Uppercase' },
                { key: 'lowercase', label: 'Include Lowercase' },
                { key: 'numbers', label: 'Include Numbers' },
                { key: 'symbols', label: 'Include Symbols' },
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
              <label className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                Număr de cuvinte
              </label>
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
            <label className={`block font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              Separator
            </label>
            <select
              value={passphraseOptions.separator}
              onChange={(event) =>
                handlePassphraseOptionChange(
                  'separator',
                  event.target.value as PassphraseOptions['separator']
                )
              }
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="-">Dash (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
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
                Capitalize words
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
                Append random number
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}