/**
 * Cloud sync status indicator for the header.
 * Shows sync status, user email, and cloud actions.
 */

import { useState, useCallback, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, LogOut, Upload, Download, Check, AlertCircle } from 'lucide-react';
import { supabase, isCloudEnabled } from '../../config/supabase';
import { uploadVault, downloadVault } from '../../services/cloudService';
import { useTranslation } from '../../contexts/LanguageContext';
import type { VaultData } from '../../types/vault';
import type { User } from '@supabase/supabase-js';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface CloudSyncIndicatorProps {
  darkMode: boolean;
  vault: VaultData | null;
  masterPassword: string;
  cloudUser: User | null;
  onVaultDownloaded: (vault: VaultData) => void;
  onCloudLogout: () => void;
}

export default function CloudSyncIndicator({
  darkMode,
  vault,
  masterPassword,
  cloudUser,
  onVaultDownloaded,
  onCloudLogout,
}: CloudSyncIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // Hide success after 2s
  useEffect(() => {
    if (syncStatus === 'success') {
      const timer = setTimeout(() => setSyncStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleUpload = useCallback(async () => {
    if (!vault || !masterPassword) return;
    setSyncStatus('syncing');
    setError('');
    try {
      await uploadVault(vault, masterPassword);
      setSyncStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setSyncStatus('error');
    }
    setShowMenu(false);
  }, [vault, masterPassword]);

  const handleDownload = useCallback(async () => {
    if (!masterPassword) return;
    setSyncStatus('syncing');
    setError('');
    try {
      const cloudVault = await downloadVault(masterPassword);
      if (cloudVault) {
        onVaultDownloaded(cloudVault);
        setSyncStatus('success');
      } else {
        setError(t.cloudNoVault);
        setSyncStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setSyncStatus('error');
    }
    setShowMenu(false);
  }, [masterPassword, onVaultDownloaded, t]);

  const handleLogout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    onCloudLogout();
    setShowMenu(false);
  }, [onCloudLogout]);

  if (!isCloudEnabled || !cloudUser) {
    return null;
  }

  const statusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={14} className="animate-spin text-blue-400" />;
      case 'success':
        return <Check size={14} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return <Cloud size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
          darkMode
            ? 'hover:bg-gray-700/50 text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        title={cloudUser.email ?? t.cloudSyncTitle}
      >
        {statusIcon()}
        <span className="hidden sm:inline max-w-[100px] truncate">
          {cloudUser.email?.split('@')[0]}
        </span>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

          <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-50 overflow-hidden ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* User info */}
            <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {cloudUser.email}
              </p>
              <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t.cloudSyncTitle}
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10">
                <p className="text-[10px] text-red-500">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={() => void handleUpload()}
                disabled={!vault || !masterPassword || syncStatus === 'syncing'}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-40 ${
                  darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Upload size={14} className="text-blue-500" />
                {t.cloudUpload}
              </button>
              <button
                onClick={() => void handleDownload()}
                disabled={!masterPassword || syncStatus === 'syncing'}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all disabled:opacity-40 ${
                  darkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Download size={14} className="text-emerald-500" />
                {t.cloudDownload}
              </button>

              <div className={`my-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

              <button
                onClick={() => void handleLogout()}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  darkMode ? 'hover:bg-gray-700/50 text-red-400' : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <LogOut size={14} />
                {t.cloudLogout}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Offline indicator — shown when cloud is not configured
export function OfflineIndicator({ darkMode }: { darkMode: boolean }) {
  const { t } = useTranslation();
  if (isCloudEnabled) return null;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${
        darkMode ? 'text-gray-600' : 'text-gray-400'
      }`}
      title={t.cloudOfflineDesc}
    >
      <CloudOff size={12} />
      <span className="hidden sm:inline">{t.cloudOffline}</span>
    </div>
  );
}
