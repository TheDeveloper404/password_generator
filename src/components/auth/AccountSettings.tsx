/**
 * Account Settings component.
 * Shows the logged-in user's profile info with editable display name.
 * Provides permanent account deletion with password confirmation.
 * Email is read-only.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  KeyRound,
  Clock,
  Save,
  Lock,
  Fingerprint,
} from 'lucide-react';
import {
  isBiometricAvailable,
  isBiometricEnrolled,
  registerBiometric,
  removeBiometric,
} from '../../services/biometricService';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import { deleteCloudVault } from '../../services/cloudService';
import { wipeAllData } from '../../db/indexedDB';
import { clearSession } from '../../services/sessionService';
import { useTranslation } from '../../contexts/LanguageContext';

interface AccountSettingsProps {
  darkMode: boolean;
  cloudUser: User;
  masterPassword?: string;
  onAccountDeleted: () => void;
  onClose: () => void;
}

type DeleteStep = 'idle' | 'confirm' | 'deleting';

export default function AccountSettings({
  darkMode,
  cloudUser,
  masterPassword,
  onAccountDeleted,
  onClose,
}: AccountSettingsProps) {
  const { t } = useTranslation();

  // Profile
  const [displayName, setDisplayName] = useState(
    cloudUser.user_metadata?.display_name || cloudUser.user_metadata?.full_name || '',
  );
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  // Account deletion
  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Biometric
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricActive, setBiometricActive] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState('');

  useEffect(() => {
    void (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const enrolled = await isBiometricEnrolled();
        setBiometricActive(enrolled);
      }
    })();
  }, []);

  const handleToggleBiometric = useCallback(async () => {
    if (!masterPassword) return;
    setBiometricLoading(true);
    setBiometricError('');
    try {
      if (biometricActive) {
        await removeBiometric();
        setBiometricActive(false);
      } else {
        await registerBiometric(masterPassword);
        setBiometricActive(true);
      }
    } catch (err) {
      setBiometricError(err instanceof Error ? err.message : t.biometricError);
    } finally {
      setBiometricLoading(false);
    }
  }, [masterPassword, biometricActive, t]);

  // Member since
  const memberSince = cloudUser.created_at
    ? new Date(cloudUser.created_at).toLocaleDateString()
    : '—';

  const lastSignIn = cloudUser.last_sign_in_at
    ? new Date(cloudUser.last_sign_in_at).toLocaleString()
    : '—';

  // Save display name
  const handleSaveName = useCallback(async () => {
    if (!supabase || !displayName.trim()) return;

    setSavingName(true);
    setNameError('');
    setNameSaved(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });
      if (error) throw error;
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 3000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : t.accountSaveError);
    } finally {
      setSavingName(false);
    }
  }, [displayName, t]);

  // Step 1: Show confirmation dialog with password input
  const handleDeleteInit = useCallback(() => {
    setDeleteStep('confirm');
    setDeleteError('');
    setDeletePassword('');
  }, []);

  // Step 2: Verify password and delete account
  const handleConfirmDelete = useCallback(async () => {
    if (!supabase || !deletePassword.trim() || !cloudUser.email) return;

    setDeleteStep('deleting');
    setDeleteError('');

    try {
      // Re-authenticate with password to confirm identity
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cloudUser.email,
        password: deletePassword,
      });
      if (authError) {
        setDeleteError(t.accountDeletePasswordError);
        setDeleteStep('confirm');
        return;
      }

      // Delete cloud vault data first
      await deleteCloudVault();

      // Wipe all local data (IndexedDB)
      await wipeAllData();
      clearSession();

      // Delete Supabase user account via server-side RPC
      const { error: deleteError } = await supabase.rpc('delete_own_account');
      if (deleteError) {
        console.warn('RPC delete_own_account failed, signing out instead:', deleteError.message);
      }

      // Sign out and clean up local state
      await supabase.auth.signOut();
      localStorage.removeItem('pg_cloud_auth');
      localStorage.removeItem('pg_free_mode');
      localStorage.removeItem('pg_free_generates');
      localStorage.removeItem('pg_terms_accepted');

      onAccountDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t.accountDeleteError);
      setDeleteStep('confirm');
    }
  }, [deletePassword, cloudUser.email, onAccountDeleted, t]);

  // Clear saved animation
  useEffect(() => {
    if (nameSaved) {
      const timer = setTimeout(() => setNameSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [nameSaved]);

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 ${
    darkMode
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-400'
  }`;

  const disabledInputClass = `w-full rounded-xl px-4 py-3 text-sm border cursor-not-allowed ${
    darkMode
      ? 'bg-gray-800/50 border-gray-700/50 text-gray-500'
      : 'bg-gray-50 border-gray-200 text-gray-400'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <UserIcon size={18} className="text-blue-500" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.accountTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Profile Section */}
          <section className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t.accountProfile}
            </h3>

            {/* Email (read-only) */}
            <div>
              <label className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Mail size={12} />
                {t.accountEmail}
              </label>
              <input
                type="email"
                value={cloudUser.email || ''}
                disabled
                className={disabledInputClass}
              />
              <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {t.accountEmailReadonly}
              </p>
            </div>

            {/* Display Name (editable) */}
            <div>
              <label className={`text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <UserIcon size={12} />
                {t.accountDisplayName}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.accountDisplayNamePlaceholder}
                  className={inputClass}
                />
                <button
                  onClick={() => void handleSaveName()}
                  disabled={savingName || !displayName.trim()}
                  className={`px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    nameSaved
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-40'
                  }`}
                >
                  {savingName ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : nameSaved ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                </button>
              </div>
              {nameError && (
                <p className="mt-1 text-xs text-red-500">{nameError}</p>
              )}
            </div>
          </section>

          {/* Account Info Section */}
          <section className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t.accountInfo}
            </h3>

            <div className={`rounded-xl border p-4 space-y-3 ${
              darkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock size={12} />
                  {t.accountMemberSince}
                </span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {memberSince}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <KeyRound size={12} />
                  {t.accountLastLogin}
                </span>
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lastSignIn}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Shield size={12} />
                  {t.accountEncryption}
                </span>
                <span className="text-xs font-medium text-emerald-500">
                  AES-256-GCM
                </span>
              </div>
            </div>
          </section>

          {/* Biometric Section */}
          <section className="space-y-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t.biometricSection}
            </h3>

            <div className={`rounded-xl border p-4 space-y-3 ${
              darkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-50 border-gray-200'
            }`}>
              {!biometricAvailable ? (
                <p className={`text-xs flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Fingerprint size={14} />
                  {t.biometricNotAvailable}
                </p>
              ) : !masterPassword ? (
                <p className={`text-xs flex items-center gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Fingerprint size={14} />
                  {t.biometricNeedMaster}
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={14} className={biometricActive ? 'text-emerald-500' : (darkMode ? 'text-gray-400' : 'text-gray-500')} />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {biometricActive ? t.biometricEnrolled : t.biometricEnable}
                      </span>
                    </div>
                    <button
                      onClick={() => void handleToggleBiometric()}
                      disabled={biometricLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        biometricActive
                          ? 'bg-emerald-500'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      } ${biometricLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          biometricActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  {biometricError && (
                    <p className="text-xs text-red-500">{biometricError}</p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Danger Zone — Account Deletion */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              {t.accountDangerZone}
            </h3>

            <div className={`rounded-xl border p-4 space-y-3 ${
              darkMode
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-red-50 border-red-200'
            }`}>
              {deleteStep === 'idle' && (
                <>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.accountDeleteDesc}
                  </p>
                  <button
                    onClick={handleDeleteInit}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} />
                    {t.accountDeleteButton}
                  </button>
                </>
              )}

              {deleteStep === 'confirm' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {t.accountDeleteWarning}
                    </p>
                  </div>

                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t.accountDeleteEnterPassword}
                  </p>

                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                      placeholder={t.accountDeletePasswordPlaceholder}
                      className={`${inputClass} pl-9`}
                      autoFocus
                    />
                  </div>

                  {deleteError && (
                    <p className="text-xs text-red-500">{deleteError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleConfirmDelete()}
                      disabled={!deletePassword.trim()}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {t.accountDeleteConfirm}
                    </button>
                    <button
                      onClick={() => { setDeleteStep('idle'); setDeletePassword(''); setDeleteError(''); }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {t.unlockResetCancel}
                    </button>
                  </div>
                </div>
              )}

              {deleteStep === 'deleting' && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={20} className="text-red-500 animate-spin" />
                  <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.accountDeleting}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
