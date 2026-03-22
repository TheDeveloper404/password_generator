/**
 * Cloud authentication component.
 * Handles Supabase login and register with email/password.
 * Includes biometric (FaceID/Fingerprint) login when enrolled.
 * Shows terms acceptance modal after successful login if not yet accepted.
 */

import { useState, useCallback, useEffect } from 'react';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Cloud, AlertCircle, Fingerprint } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../contexts/LanguageContext';
import {
  isBiometricAvailable,
  isBiometricEnrolled,
  authenticateWithBiometric,
} from '../../services/biometricService';
import TermsAcceptanceModal from './TermsAcceptanceModal';
import Footer from '../Footer';

type AuthMode = 'login' | 'register';

interface CloudAuthProps {
  darkMode: boolean;
  onAuthenticated: () => void;
  onEnterFreeMode?: () => void;
}

export default function CloudAuth({ darkMode, onAuthenticated, onEnterFreeMode }: CloudAuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [biometricReady, setBiometricReady] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { t } = useTranslation();

  // Check if biometric login is available
  useEffect(() => {
    void (async () => {
      const available = await isBiometricAvailable();
      if (available) {
        const enrolled = await isBiometricEnrolled();
        setBiometricReady(enrolled);
      }
    })();
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    if (!supabase || biometricLoading) return;
    setBiometricLoading(true);
    setError('');

    try {
      // Authenticate with biometric — verifies user identity
      await authenticateWithBiometric();

      // Check if Supabase session exists (persisted in localStorage)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Session exists — biometric verified, proceed
        const termsAccepted = localStorage.getItem('pg_terms_accepted') === 'true';
        if (!termsAccepted) {
          setShowTermsModal(true);
        } else {
          onAuthenticated();
        }
      } else {
        // No active session — need email/password login first
        setError(t.biometricNeedLogin);
      }
    } catch {
      setError(t.biometricError);
    } finally {
      setBiometricLoading(false);
    }
  }, [biometricLoading, onAuthenticated, t]);

  const handleEmailAuth = useCallback(async () => {
    if (!supabase || !email || !password) return;

    if (mode === 'register' && password !== confirmPassword) {
      setError(t.cloudPasswordMismatch);
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError(t.cloudPasswordTooShort);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        // Check if terms were already accepted
        const termsAccepted = localStorage.getItem('pg_terms_accepted') === 'true';
        if (!termsAccepted) {
          setShowTermsModal(true);
        } else {
          onAuthenticated();
        }
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;
        setSuccess(t.cloudCheckEmail);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cloudAuthError);
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, mode, onAuthenticated, t]);

  const handleTermsAccepted = useCallback(() => {
    setShowTermsModal(false);
    onAuthenticated();
  }, [onAuthenticated]);

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-400'
  }`;

  return (
    <>
      <div className="min-h-screen flex flex-col"
        style={{
          background: darkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #f0fdf4 100%)',
        }}
      >
        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 space-y-5 ${
            darkMode ? 'bg-gray-900/90 border-gray-700/50 backdrop-blur-sm' : 'bg-white/90 border-gray-200 backdrop-blur-sm'
          }`}>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${
                darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Cloud size={28} className="text-blue-500" />
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t.cloudTitle}
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.cloudDesc}
              </p>
            </div>

            {/* Biometric login button */}
            {biometricReady && mode === 'login' && (
              <button
                onClick={() => void handleBiometricLogin()}
                disabled={biometricLoading}
                className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Fingerprint size={20} className={biometricLoading ? 'animate-pulse' : ''} />
                {biometricLoading ? t.cloudLoading : t.biometricLoginButton}
              </button>
            )}

            {/* Divider when biometric is available */}
            {biometricReady && mode === 'login' && (
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.cloudOr}</span>
                <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
            )}

            {/* Mode toggle */}
            <div className={`flex rounded-xl p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                    mode === m
                      ? darkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-blue-700 shadow-md'
                      : darkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                  {m === 'login' ? t.cloudLogin : t.cloudRegister}
                </button>
              ))}
            </div>

            {/* Error / Success messages */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Mail size={16} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-green-500">{success}</p>
              </div>
            )}

            {/* Email / Password form */}
            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.cloudEmail}
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative">
                <Lock size={16} className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.cloudPassword}
                  className={`${inputClass} pl-10 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <Lock size={16} className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.cloudConfirmPassword}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              )}

              <button
                onClick={() => void handleEmailAuth()}
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                {loading ? t.cloudLoading : mode === 'login' ? t.cloudLoginButton : t.cloudRegisterButton}
              </button>
            </div>

            {/* Zero-knowledge note */}
            <p className={`text-[10px] text-center leading-relaxed ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {t.cloudZeroKnowledge}
            </p>

            {/* Free mode button */}
            {onEnterFreeMode && (
              <button
                onClick={onEnterFreeMode}
                className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  darkMode
                    ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/50'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.freeModeButton}
              </button>
            )}
          </div>
        </div>

        <Footer darkMode={darkMode} />
      </div>

      {/* Terms acceptance modal */}
      {showTermsModal && (
        <TermsAcceptanceModal
          darkMode={darkMode}
          onAccepted={handleTermsAccepted}
        />
      )}
    </>
  );
}
