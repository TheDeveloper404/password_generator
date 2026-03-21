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
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
          <User size={13} className="text-white" />
        </div>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {t.usernameTitle}
        </h3>
      </div>

      <p className={`text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {t.usernameDesc}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t.usernameFirstName}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
            darkMode
              ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-500'
              : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
          }`}
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t.usernameLastName}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all ${
            darkMode
              ? 'border-gray-600 bg-gray-700/50 text-white placeholder-gray-500'
              : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canGenerate) handleGenerate();
          }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`w-full py-2.5 px-4 font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
          canGenerate
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg active:scale-[0.98]'
            : darkMode
              ? 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <RefreshCw size={13} />
        {t.usernameGenerate}
      </button>

      {usernames.length > 0 && (
        <div className="space-y-1">
          {usernames.map((username, idx) => (
            <div
              key={`${username}-${idx}`}
              className={`group flex items-center justify-between rounded-lg px-3 py-1.5 transition-all ${
                darkMode ? 'hover:bg-gray-700/50 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-mono text-xs truncate">{username}</span>
              <button
                onClick={() => void handleCopy(username, idx)}
                className={`ml-2 p-1 rounded-md transition-all ${
                  copiedIdx === idx
                    ? 'text-emerald-400'
                    : darkMode
                      ? 'opacity-0 group-hover:opacity-100 hover:bg-gray-600 text-gray-400'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400'
                }`}
                title={t.usernameCopy}
              >
                <Copy size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
