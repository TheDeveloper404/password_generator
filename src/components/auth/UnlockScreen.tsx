import { useEffect, useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { isLockedOut, getRemainingLockoutMs, getFailedAttempts } from '../../services/authService';
import { MAX_UNLOCK_ATTEMPTS } from '../../crypto/constants';

interface UnlockScreenProps {
  darkMode: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onReset: () => void;
}

export default function UnlockScreen({ darkMode, onUnlock, onReset }: UnlockScreenProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Update lockout timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLockedOut()) {
        setLockoutRemaining(Math.ceil(getRemainingLockoutMs() / 1000));
      } else {
        setLockoutRemaining(0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading || lockoutRemaining > 0) return;

    setLoading(true);
    setError('');

    try {
      const success = await onUnlock(password);
      if (!success) {
        const attempts = getFailedAttempts();
        if (isLockedOut()) {
          setError(t.unlockLockedOut);
        } else {
          setError(
            `${t.unlockWrongPassword} (${attempts}/${MAX_UNLOCK_ATTEMPTS})`,
          );
        }
        setPassword('');
      }
    } catch {
      setError(t.unlockError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
              <Lock size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mt-2">
            PassGen
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.unlockSubtitle}
          </p>
        </div>

        {/* Unlock card */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className={`rounded-2xl p-6 space-y-5 ${darkMode ? 'bg-gray-800/70 border border-gray-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.unlockMasterPassword}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={lockoutRemaining > 0}
                autoFocus
                className={`w-full px-4 py-3 pr-12 rounded-xl text-sm font-mono transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
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

          {lockoutRemaining > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
              <AlertTriangle size={14} />
              {t.unlockLockedOutTimer(lockoutRemaining)}
            </div>
          )}

          {error && !lockoutRemaining && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading || lockoutRemaining > 0}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${password && !loading && !lockoutRemaining ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl active:scale-[0.98]' : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}`}
          >
            {loading ? t.unlockLoading : t.unlockButton}
          </button>

          {/* Reset vault link */}
          <div className="text-center pt-2">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className={`text-xs ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                {t.unlockForgot}
              </button>
            ) : (
              <div className={`text-xs space-y-2 p-3 rounded-lg ${darkMode ? 'bg-red-500/5 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-red-400 font-medium">{t.unlockResetWarning}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={onReset}
                    className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    {t.unlockResetConfirm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t.unlockResetCancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
