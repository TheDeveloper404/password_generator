import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Star,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  FolderOpen,
  Tag,
  ChevronDown,
  Shield,
  Download,
  Upload,
  KeyRound,
  Lock,
  FolderPlus,
  Timer,
  FileSpreadsheet,
  Fingerprint,
} from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { VaultData, VaultEntry } from '../../types/vault';
import { filterEntries, getAllTags, type VaultFilter } from '../../services/vaultService';
import {
  getSessionTimeout,
  setSessionTimeout,
  SESSION_TIMEOUT_OPTIONS,
  type SessionTimeout,
} from '../../services/sessionService';
import VaultEntryForm from './VaultEntryForm';
import { generatePassword } from '../../utils/passwordUtils';
import ImportCsvDialog from './ImportCsvDialog';
import {
  isBiometricAvailable,
  isBiometricEnrolled,
  registerBiometric,
  removeBiometric,
} from '../../services/biometricService';
import {
  isPatternEnrolled,
  registerPattern,
  removePattern,
} from '../../services/patternLockService';
import PatternLock from './PatternLock';

interface VaultViewProps {
  darkMode: boolean;
  vault: VaultData;
  onAddEntry: (entry: Partial<VaultEntry>) => void;
  onUpdateEntry: (id: string, updates: Partial<VaultEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddFolder: (name: string) => void;
  onExport: () => void;
  onImport: () => void;
  onLock: () => void;
  masterPassword?: string;
}

export default function VaultView({
  darkMode,
  vault,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onToggleFavorite,
  onAddFolder,
  onExport,
  onImport,
  onLock,
  masterPassword,
}: VaultViewProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<VaultFilter>({});
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | undefined>();
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricActive, setBiometricActive] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [patternActive, setPatternActive] = useState(false);
  const [showPatternSetup, setShowPatternSetup] = useState(false);
  const [patternError, setPatternError] = useState('');
  const [pendingPattern, setPendingPattern] = useState<number[] | null>(null);

  // Check biometric availability and pattern lock on mount
  useEffect(() => {
    void (async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);
      if (available) {
        const enrolled = await isBiometricEnrolled();
        setBiometricActive(enrolled);
      }
      setPatternActive(isPatternEnrolled());
    })();
  }, []);

  const filteredEntries = useMemo(() => filterEntries(vault, filter), [vault, filter]);
  const allTags = useMemo(() => getAllTags(vault), [vault]);

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggleBiometric = async () => {
    if (biometricLoading) return;
    setBiometricLoading(true);
    try {
      if (biometricActive) {
        await removeBiometric();
        setBiometricActive(false);
      } else if (masterPassword) {
        await registerBiometric(masterPassword);
        setBiometricActive(true);
      }
    } catch {
      // User cancelled or error — silently ignore
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleCsvImport = (entries: Partial<VaultEntry>[]) => {
    for (const entry of entries) {
      onAddEntry(entry);
    }
    alert(t.csvImportSuccess(entries.length));
  };

  const handlePatternSetup = async (pattern: number[]) => {
    if (!pendingPattern) {
      // First draw — save and ask to confirm
      setPendingPattern(pattern);
      setPatternError('');
      return;
    }

    // Second draw — verify match
    if (pattern.join('-') !== pendingPattern.join('-')) {
      setPatternError(t.patternMismatch);
      setPendingPattern(null);
      return;
    }

    // Patterns match — register
    if (masterPassword) {
      try {
        await registerPattern(pattern, masterPassword);
        setPatternActive(true);
        setShowPatternSetup(false);
        setPendingPattern(null);
        setPatternError('');
      } catch {
        setPatternError(t.patternError);
      }
    }
  };

  const handleRemovePattern = () => {
    removePattern();
    setPatternActive(false);
  };

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = (data: Partial<VaultEntry>) => {
    if (editingEntry) {
      onUpdateEntry(editingEntry.id, data);
    } else {
      onAddEntry(data);
    }
    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleEdit = (entry: VaultEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  const generatePasswordForForm = (): string => {
    return generatePassword(20, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
  };

  const getFaviconUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  // If showing the form
  if (showForm) {
    return (
      <div className={`rounded-2xl p-5 transition-all ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
        <VaultEntryForm
          darkMode={darkMode}
          entry={editingEntry}
          folders={vault.folders}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingEntry(undefined); }}
          onGeneratePassword={generatePasswordForForm}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vault header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <KeyRound size={14} className="text-blue-500" />
          </div>
          <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t.vaultTitle}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            {vault.entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
          >
            <Plus size={13} />
            {t.vaultAdd}
          </button>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className={`p-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <ChevronDown size={14} />
            </button>
            {showActionsMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                <div className={`absolute right-0 mt-1 w-44 rounded-xl overflow-hidden z-20 shadow-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <button
                    onClick={() => { setShowFolderInput(true); setShowActionsMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <FolderPlus size={13} /> {t.vaultNewFolder}
                  </button>
                  <button
                    onClick={() => { onExport(); setShowActionsMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Download size={13} /> {t.vaultExport}
                  </button>
                  <button
                    onClick={() => { onImport(); setShowActionsMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Upload size={13} /> {t.vaultImport}
                  </button>
                  <button
                    onClick={() => { setShowCsvImport(true); setShowActionsMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <FileSpreadsheet size={13} /> {t.vaultImportCsv}
                  </button>
                  <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                  {/* Biometric toggle (for login — enroll/unenroll) */}
                  {biometricAvailable && (
                    <button
                      onClick={() => { void handleToggleBiometric(); setShowActionsMenu(false); }}
                      disabled={biometricLoading}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Fingerprint size={13} />
                      {biometricActive ? t.biometricDisable : t.biometricEnable}
                      {biometricActive && (
                        <span className="ml-auto text-[10px] text-emerald-500">●</span>
                      )}
                    </button>
                  )}
                  {/* Pattern lock toggle */}
                  <button
                    onClick={() => {
                      if (patternActive) {
                        handleRemovePattern();
                      } else {
                        setShowPatternSetup(true);
                        setPendingPattern(null);
                        setPatternError('');
                      }
                      setShowActionsMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Shield size={13} />
                    {patternActive ? t.patternDisable : t.patternEnable}
                    {patternActive && (
                      <span className="ml-auto text-[10px] text-emerald-500">●</span>
                    )}
                  </button>
                  <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                  {/* Session timeout selector */}
                  <SessionTimeoutSelector darkMode={darkMode} />
                  <div className={`h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                  <button
                    onClick={() => { onLock(); setShowActionsMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-500 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <Lock size={13} /> {t.vaultLock}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New folder input */}
      {showFolderInput && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            placeholder={t.vaultFolderPlaceholder}
            autoFocus
            className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          <button onClick={handleAddFolder} className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600">
            {t.vaultFormSave}
          </button>
          <button onClick={() => setShowFolderInput(false)} className={`px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {t.vaultFormCancel}
          </button>
        </div>
      )}

      {/* Search & filter bar */}
      <div className="flex flex-col gap-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200/80'}`}>
          <Search size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
          <input
            type="text"
            value={filter.search ?? ''}
            onChange={(e) => setFilter({ ...filter, search: e.target.value || undefined })}
            className={`flex-1 bg-transparent text-xs focus:outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            placeholder={t.vaultSearchPlaceholder}
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {/* Folder filter */}
          <button
            onClick={() => setFilter({ ...filter, folder: undefined })}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${!filter.folder ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300'}`}
          >
            {t.vaultAllFolders}
          </button>
          {vault.folders.map((f) => (
            <button
              key={f}
              onClick={() => setFilter({ ...filter, folder: filter.folder === f ? undefined : f })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${filter.folder === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300'}`}
            >
              <FolderOpen size={10} /> {f}
            </button>
          ))}
          <button
            onClick={() => setFilter({ ...filter, favoritesOnly: !filter.favoritesOnly })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${filter.favoritesOnly ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300'}`}
          >
            <Star size={10} /> {t.vaultFavorites}
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter({ ...filter, tag: filter.tag === tag ? undefined : tag })}
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] transition-all ${filter.tag === tag ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : darkMode ? 'bg-gray-800/50 text-gray-500 border border-gray-700/50' : 'bg-gray-50 text-gray-400 border border-gray-200/50'}`}
              >
                <Tag size={8} /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entry list */}
      {filteredEntries.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <Shield size={32} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">{filter.search ? t.vaultNoResults : t.vaultEmpty}</p>
          <p className="text-xs mt-1 opacity-60">
            {filter.search ? t.vaultTryDifferentSearch : t.vaultEmptyHint}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((entry) => {
            const isRevealed = revealedPasswords.has(entry.id);
            const isCopied = copiedId === entry.id;
            const isCopiedUser = copiedId === `user-${entry.id}`;
            const favicon = getFaviconUrl(entry.siteUrl);

            return (
              <div
                key={entry.id}
                className={`group rounded-xl p-3 transition-all ${darkMode ? 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/60 hover:border-gray-700/50' : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
              >
                <div className="flex items-start gap-3">
                  {/* Favicon / Icon */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {favicon ? (
                      <img src={favicon} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <Globe size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {entry.title}
                      </span>
                      {entry.favorite && <Star size={12} className="text-amber-400 flex-shrink-0" fill="currentColor" />}
                    </div>

                    {entry.username && (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {entry.username}
                        </span>
                        <button
                          onClick={() => void handleCopy(entry.username, `user-${entry.id}`)}
                          className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isCopiedUser ? 'text-emerald-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {isCopiedUser ? <Copy size={10} /> : <Copy size={10} />}
                        </button>
                      </div>
                    )}

                    {entry.password && (
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {isRevealed ? entry.password : '•'.repeat(Math.min(entry.password.length, 20))}
                        </span>
                        <button
                          onClick={() => toggleReveal(entry.id)}
                          className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          {isRevealed ? <EyeOff size={10} /> : <Eye size={10} />}
                        </button>
                        <button
                          onClick={() => void handleCopy(entry.password, entry.id)}
                          className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isCopied ? 'text-emerald-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Copy size={10} />
                        </button>
                      </div>
                    )}

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.tags.map((tag) => (
                          <span key={tag} className={`px-1.5 py-0.5 rounded text-[9px] ${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleFavorite(entry.id)}
                      className={`p-1.5 rounded-lg ${entry.favorite ? 'text-amber-400' : darkMode ? 'text-gray-500 hover:text-amber-400' : 'text-gray-400 hover:text-amber-400'} transition-colors`}
                    >
                      <Star size={13} fill={entry.favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleEdit(entry)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'} transition-colors`}
                    >
                      <Edit3 size={13} />
                    </button>
                    {confirmDeleteId === entry.id ? (
                      <button
                        onClick={() => { onDeleteEntry(entry.id); setConfirmDeleteId(null); }}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        {t.vaultConfirmDelete}
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(entry.id)}
                        className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Dialog */}
      {showCsvImport && (
        <ImportCsvDialog
          darkMode={darkMode}
          onImport={handleCsvImport}
          onClose={() => setShowCsvImport(false)}
        />
      )}

      {/* Pattern Lock Setup Modal */}
      {showPatternSetup && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`relative w-full max-w-xs rounded-2xl border shadow-2xl p-6 space-y-4 ${
            darkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-center text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.patternSetupTitle}
            </h3>
            {pendingPattern && (
              <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t.patternConfirm}
              </p>
            )}
            <PatternLock
              darkMode={darkMode}
              onPatternComplete={(p) => void handlePatternSetup(p)}
              error={patternError}
              mode="setup"
            />
            <button
              onClick={() => { setShowPatternSetup(false); setPendingPattern(null); setPatternError(''); }}
              className={`w-full py-2 rounded-xl text-xs font-medium transition-all ${
                darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t.vaultFormCancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Session Timeout Selector ──────────────────────────────────────

function SessionTimeoutSelector({ darkMode }: { darkMode: boolean }) {
  const { t } = useTranslation();
  const [timeout, setTimeoutVal] = useState<SessionTimeout>(getSessionTimeout);

  const handleChange = (value: SessionTimeout) => {
    setTimeoutVal(value);
    setSessionTimeout(value);
  };

  const getLabel = (minutes: SessionTimeout): string => {
    if (minutes === 0) return t.sessionDisabled;
    if (minutes === 60) return t.sessionHour;
    return t.sessionMinutes(minutes);
  };

  return (
    <div className={`px-3 py-2.5`}>
      <div className={`flex items-center gap-2 text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <Timer size={13} />
        {t.sessionTimeout}
      </div>
      <div className="flex flex-wrap gap-1">
        {SESSION_TIMEOUT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handleChange(opt)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              timeout === opt
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt === 0 ? t.sessionOff : opt === 60 ? t.sessionOneHourShort : t.sessionMinutesShort(opt)}
          </button>
        ))}
      </div>
      <div className={`mt-1.5 text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {getLabel(timeout)}
      </div>
    </div>
  );
}
