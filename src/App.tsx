import { useCallback, useEffect, useState, useRef } from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import WelcomePage from './components/WelcomePage';
import CloudAuth from './components/auth/CloudAuth';
import type { AppScreen, VaultData } from './types/vault';
import {
  setupMasterPassword,
  verifyAndUnlock,
  isVaultSetUp,
} from './services/authService';
import {
  encryptAndSaveVault,
  createEntry,
  addEntry,
  updateEntry,
  deleteEntry,
  toggleFavorite,
  addFolder,
} from './services/vaultService';
import {
  exportVault as exportVaultData,
  importVault as importVaultData,
  downloadExport,
  readFileAsText,
} from './services/exportService';
import { uploadVault } from './services/cloudService';
import { supabase, isCloudEnabled } from './lib/supabase';
import { wipeAllData } from './db/indexedDB';
import { AUTO_LOCK_TIMEOUT_MS } from './crypto/constants';
import { Language, translations } from './utils/i18n';
import { LanguageContext } from './contexts/LanguageContext';
import {
  saveSession,
  restoreSession,
  clearSession,
  refreshSession,
} from './services/sessionService';
import type { User } from '@supabase/supabase-js';

function getStoredLang(): Language {
  try {
    const raw = localStorage.getItem('pg_lang');
    if (raw) return JSON.parse(raw) as Language;
  } catch { /* ignore */ }
  return 'ro';
}

function getStoredDarkMode(): boolean {
  try {
    const raw = localStorage.getItem('pg_dark_mode');
    if (raw) return JSON.parse(raw) as boolean;
  } catch { /* ignore */ }
  return true;
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [transitioning, setTransitioning] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [vaultSalt, setVaultSalt] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [vaultConfigured, setVaultConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>(getStoredLang);
  const [darkMode, setDarkMode] = useState(getStoredDarkMode);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [showCloudAuth, setShowCloudAuth] = useState(false);
  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[lang];

  // ─── Supabase Auth Listener ─────────────────────────────────────────
  useEffect(() => {
    if (!isCloudEnabled || !supabase) return;

    // Check initial session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setCloudUser(session?.user ?? null);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCloudUser(session?.user ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Persist lang & darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('pg_lang', JSON.stringify(lang));
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('pg_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check if vault is set up on mount + try session restore
  useEffect(() => {
    void (async () => {
      try {
        const hasVault = await isVaultSetUp();
        setVaultConfigured(hasVault);
        if (hasVault) {
          // Try to restore session (survives refresh)
          const session = restoreSession();
          if (session) {
            const result = await verifyAndUnlock(session.masterPassword);
            if (result) {
              setMasterPassword(session.masterPassword);
              setVaultSalt(result.salt);
              setVault(result.vault);
            }
          }
          // Skip welcome, go straight to main
          setScreen('main');
          setWelcomeVisible(false);
          setTransitioning(true);
        } else {
          setScreen('welcome');
        }
      } catch {
        setScreen('welcome');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Lock handler (defined early so resetAutoLock can reference it)
  const handleLock = useCallback(() => {
    setVault(null);
    setMasterPassword('');
    setVaultSalt(null);
    clearSession();
    // Stay on main screen — generator still works, vault/health show unlock
  }, []);

  // Auto-lock on inactivity
  const resetAutoLock = useCallback(() => {
    if (autoLockTimer.current) {
      clearTimeout(autoLockTimer.current);
    }
    if (vault && masterPassword) {
      autoLockTimer.current = setTimeout(() => {
        handleLock();
      }, AUTO_LOCK_TIMEOUT_MS);
    }
  }, [vault, masterPassword, handleLock]);

  useEffect(() => {
    if (!vault) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => {
      resetAutoLock();
      refreshSession();
    };
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetAutoLock();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    };
  }, [vault, resetAutoLock]);

  // Persist vault whenever it changes (local + cloud)
  useEffect(() => {
    if (vault && masterPassword && vaultSalt) {
      void encryptAndSaveVault(vault, masterPassword, vaultSalt);

      // Auto-sync to cloud if authenticated
      if (isCloudEnabled && cloudUser) {
        void uploadVault(vault, masterPassword).catch(() => {
          // Silent fail — cloud sync is best-effort
        });
      }
    }
  }, [vault, masterPassword, vaultSalt, cloudUser]);

  // ─── Screen Transitions ────────────────────────────────────────────

  const handleWelcomeEnter = useCallback(async () => {
    // Welcome page is always dark-themed, so ensure main app starts in dark mode
    setDarkMode(true);
    // Sync dark class immediately (don't wait for useEffect)
    document.documentElement.classList.add('dark');
    setTransitioning(true);
    setWelcomeVisible(false);

    // If cloud is enabled but user is not logged in, show cloud auth
    if (isCloudEnabled && !cloudUser) {
      setTimeout(() => {
        setShowCloudAuth(true);
        setScreen('main');
      }, 700);
    } else {
      setTimeout(() => {
        setScreen('main');
      }, 700);
    }
  }, [cloudUser]);

  const handleCloudAuthenticated = useCallback(() => {
    setShowCloudAuth(false);
  }, []);

  const handleCloudSkip = useCallback(() => {
    setShowCloudAuth(false);
  }, []);

  const handleCloudLogout = useCallback(() => {
    setCloudUser(null);
  }, []);

  const handleVaultDownloaded = useCallback((downloadedVault: VaultData) => {
    setVault(downloadedVault);
  }, []);

  const handleLogout = useCallback(() => {
    // Lock vault if unlocked
    handleLock();
    // Clear saved tab so refresh after logout goes to Generator
    sessionStorage.removeItem('passgen_active_tab');
    // Transition back to welcome
    setWelcomeVisible(true);
    setTransitioning(false);
    setScreen('welcome');
    setShowCloudAuth(false);
  }, [handleLock]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen === 'welcome' && e.key === 'Enter') {
        e.preventDefault();
        void handleWelcomeEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, handleWelcomeEnter]);

  // ─── Auth Handlers ──────────────────────────────────────────────────

  const handleSetup = async (password: string) => {
    const { salt } = await setupMasterPassword(password);
    setMasterPassword(password);
    setVaultSalt(salt);
    setVaultConfigured(true);

    // Load the newly created empty vault
    const result = await verifyAndUnlock(password);
    if (result) {
      setVault(result.vault);
      saveSession(password, salt);
    }
  };

  const handleUnlock = async (password: string): Promise<boolean> => {
    const result = await verifyAndUnlock(password);
    if (!result) return false;

    setMasterPassword(password);
    setVaultSalt(result.salt);
    setVault(result.vault);
    saveSession(password, result.salt);
    return true;
  };

  const handleReset = async () => {
    await wipeAllData();
    setVault(null);
    setMasterPassword('');
    setVaultSalt(null);
    setVaultConfigured(false);
    clearSession();
  };

  // ─── Vault CRUD Handlers ────────────────────────────────────────────

  const handleAddEntry = (data: Partial<import('./types/vault').VaultEntry>) => {
    if (!vault) return;
    const entry = createEntry(data);
    setVault(addEntry(vault, entry));
  };

  const handleUpdateEntry = (id: string, updates: Partial<import('./types/vault').VaultEntry>) => {
    if (!vault) return;
    setVault(updateEntry(vault, id, updates));
  };

  const handleDeleteEntry = (id: string) => {
    if (!vault) return;
    setVault(deleteEntry(vault, id));
  };

  const handleToggleFavorite = (id: string) => {
    if (!vault) return;
    setVault(toggleFavorite(vault, id));
  };

  const handleAddFolder = (name: string) => {
    if (!vault) return;
    setVault(addFolder(vault, name));
  };

  // ─── Export / Import ────────────────────────────────────────────────

  const handleExport = async () => {
    if (!vault || !masterPassword) return;
    const exportPassword = prompt(t.vaultExportPasswordPrompt);
    if (!exportPassword) return;

    try {
      const data = await exportVaultData(vault, exportPassword);
      downloadExport(data);
    } catch {
      alert(t.vaultExportError);
    }
  };

  const handleImport = () => {
    if (!vault) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const importPassword = prompt(t.vaultImportPasswordPrompt);
      if (!importPassword) return;

      try {
        const text = await readFileAsText(file);
        const importedVault = await importVaultData(text, importPassword);

        // Merge imported entries into current vault
        const merged: VaultData = {
          ...vault,
          entries: [
            ...vault.entries,
            ...importedVault.entries.filter(
              (ie) => !vault.entries.some((ve) => ve.id === ie.id),
            ),
          ],
          folders: [...new Set([...vault.folders, ...importedVault.folders])],
          lastModified: Date.now(),
        };
        setVault(merged);
        alert(t.vaultImportSuccess(importedVault.entries.length));
      } catch (err) {
        alert(err instanceof Error ? err.message : t.vaultImportError);
      }
    };
    input.click();
  };

  // ─── Render ─────────────────────────────────────────────────────────

  if (loading) return null;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {/* Welcome page overlay */}
      {(screen === 'welcome' || (transitioning && welcomeVisible)) && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-700 ease-in-out ${
            welcomeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        >
          <WelcomePage onEnter={() => void handleWelcomeEnter()} />
        </div>
      )}

      {/* Cloud auth screen — shown when cloud is enabled but user not logged in */}
      {showCloudAuth && !cloudUser && (
        <div className="fixed inset-0 z-40 animate-fadeIn">
          <CloudAuth
            darkMode={darkMode}
            onAuthenticated={handleCloudAuthenticated}
            onSkip={handleCloudSkip}
          />
        </div>
      )}

      {/* Main app — always rendered when screen is 'main' */}
      {screen === 'main' && !showCloudAuth && (
        <div className="animate-fadeIn">
          <PasswordGenerator
            vault={vault}
            vaultConfigured={vaultConfigured}
            masterPassword={masterPassword}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            cloudUser={cloudUser}
            onCloudLogout={handleCloudLogout}
            onVaultDownloaded={handleVaultDownloaded}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
            onAddFolder={handleAddFolder}
            onExport={() => void handleExport()}
            onImport={handleImport}
            onLock={handleLock}
            onSetup={(pw) => handleSetup(pw)}
            onUnlock={handleUnlock}
            onReset={() => void handleReset()}
            onLogout={handleLogout}
          />
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export default App;
