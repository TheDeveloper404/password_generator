import { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface MasterPasswordSetupProps {
  darkMode: boolean;
  onSetup: (password: string) => Promise<void>;
  inline?: boolean;
}

export default function MasterPasswordSetup({ darkMode, onSetup, inline }: MasterPasswordSetupProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requirements = [
    { met: password.length >= 12, label: t.setupReqLength },
    { met: /[A-Z]/.test(password), label: t.setupReqUppercase },
    { met: /[a-z]/.test(password), label: t.setupReqLowercase },
    { met: /[0-9]/.test(password), label: t.setupReqNumber },
    { met: /[^A-Za-z0-9]/.test(password), label: t.setupReqSymbol },
  ];

  const allMet = requirements.every((r) => r.met);
  const passwordsMatch = password === confirm && password.length > 0;
  const canSubmit = allMet && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      await onSetup(password);
    } catch {
      setError(t.setupError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={inline ? 'flex items-center justify-center py-8' : `min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            {t.appTitle}
          </h1>
          <p className={`mt-2 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.setupSubtitle}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className={`rounded-2xl p-6 space-y-5 ${darkMode ? 'bg-gray-800/70 border border-gray-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.setupTitle}
          </h2>

          <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.setupWarning}
          </p>

          {/* Master password input */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.setupMasterPassword}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-12 rounded-xl text-sm font-mono transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Requirements list */}
          <div className="space-y-1.5">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500/20 text-emerald-500' : darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                  {req.met && <Check size={10} />}
                </div>
                <span className={`text-xs ${req.met ? 'text-emerald-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.setupConfirm}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-mono transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="••••••••••••"
            />
            {confirm && !passwordsMatch && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle size={12} />
                {t.setupMismatch}
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${canSubmit ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl active:scale-[0.98]' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
          >
            {loading ? t.setupLoading : t.setupButton}
          </button>
        </form>
      </div>
    </div>
  );
}
