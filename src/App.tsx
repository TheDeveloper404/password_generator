import { useCallback, useEffect, useState, useRef } from 'react';
import PasswordGenerator from './components/PasswordGenerator';
import WelcomePage from './components/WelcomePage';
import MasterPasswordSetup from './components/auth/MasterPasswordSetup';
import UnlockScreen from './components/auth/UnlockScreen';
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
import { wipeAllData } from './db/indexedDB';
import { AUTO_LOCK_TIMEOUT_MS } from './crypto/constants';
import { Language, translations } from './utils/i18n';
import { LanguageContext } from './contexts/LanguageContext';

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
  return false;
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [transitioning, setTransitioning] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [vaultSalt, setVaultSalt] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>(getStoredLang);
  const [darkMode, setDarkMode] = useState(getStoredDarkMode);
  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[lang];

  // Persist lang & darkMode to localStorage
  useEffect(() => {
    localStorage.setItem('pg_lang', JSON.stringify(lang));
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('pg_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Check if vault is set up on mount
  useEffect(() => {
    void (async () => {
      try {
        const hasVault = await isVaultSetUp();
        if (hasVault) {
          setScreen('welcome');
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
  }, [vault, masterPassword]);

  useEffect(() => {
    if (!vault) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => resetAutoLock();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetAutoLock();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    };
  }, [vault, resetAutoLock]);

  // Persist vault whenever it changes
  useEffect(() => {
    if (vault && masterPassword && vaultSalt) {
      void encryptAndSaveVault(vault, masterPassword, vaultSalt);
    }
  }, [vault, masterPassword, vaultSalt]);

  // ─── Screen Transitions ────────────────────────────────────────────

  const handleWelcomeEnter = useCallback(async () => {
    setTransitioning(true);
    setWelcomeVisible(false);

    const hasVault = await isVaultSetUp();

    setTimeout(() => {
      setScreen(hasVault ? 'unlock' : 'setup');
    }, 700);
  }, []);

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

    // Load the newly created empty vault
    const result = await verifyAndUnlock(password);
    if (result) {
      setVault(result.vault);
      setScreen('main');
    }
  };

  const handleUnlock = async (password: string): Promise<boolean> => {
    const result = await verifyAndUnlock(password);
    if (!result) return false;

    setMasterPassword(password);
    setVaultSalt(result.salt);
    setVault(result.vault);
    setScreen('main');
    return true;
  };

  const handleLock = useCallback(() => {
    setVault(null);
    setMasterPassword('');
    setVaultSalt(null);
    setScreen('unlock');
  }, []);

  const handleReset = async () => {
    await wipeAllData();
    setVault(null);
    setMasterPassword('');
    setVaultSalt(null);
    setScreen('setup');
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

      {/* Setup screen */}
      {screen === 'setup' && (
        <div className="animate-fadeIn">
          <MasterPasswordSetup
            darkMode={darkMode}
            onSetup={(pw) => handleSetup(pw)}
          />
        </div>
      )}

      {/* Unlock screen */}
      {screen === 'unlock' && (
        <div className="animate-fadeIn">
          <UnlockScreen
            darkMode={darkMode}
            onUnlock={handleUnlock}
            onReset={() => void handleReset()}
          />
        </div>
      )}

      {/* Main app */}
      {screen === 'main' && vault && (
        <div className="animate-fadeIn">
          <PasswordGenerator
            vault={vault}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
            onAddFolder={handleAddFolder}
            onExport={() => void handleExport()}
            onImport={handleImport}
            onLock={handleLock}
          />
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export default App;
