import { useState } from 'react';
import { Copy, RefreshCw, User } from 'lucide-react';
import { generateUsernames } from '../utils/usernameUtils';
import { useTranslation } from '../contexts/LanguageContext';

interface UsernameGeneratorProps {
  darkMode: boolean;
}

export default function UsernameGenerator({ darkMode }: UsernameGeneratorProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = () => {
    const result = generateUsernames({ firstName, lastName });
    setUsernames(result.usernames);
    setCopiedIdx(null);
  };

  const handleCopy = async (username: string, idx: number) => {
    await navigator.clipboard.writeText(username);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const canGenerate = firstName.trim() || lastName.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User size={16} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.usernameTitle}
        </h3>
      </div>

      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {t.usernameDesc}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t.usernameFirstName}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            darkMode
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
          }`}
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t.usernameLastName}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            darkMode
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canGenerate) handleGenerate();
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`w-full py-2.5 px-4 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
          canGenerate
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : darkMode
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <RefreshCw size={14} />
        {t.usernameGenerate}
      </button>

      {usernames.length > 0 && (
        <div className="space-y-1.5">
          {usernames.map((username, idx) => (
            <div
              key={`${username}-${idx}`}
              className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm ${
                darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <span className="font-mono text-xs truncate">{username}</span>
              <button
                onClick={() => void handleCopy(username, idx)}
                className={`ml-2 p-1 rounded transition-colors ${
                  copiedIdx === idx
                    ? 'text-green-500'
                    : darkMode
                      ? 'hover:bg-gray-600 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-500'
                }`}
                title={t.usernameCopy}
              >
                <Copy size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
