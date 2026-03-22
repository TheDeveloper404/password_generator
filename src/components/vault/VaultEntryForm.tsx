import { useState } from 'react';
import { Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import type { VaultEntry } from '../../types/vault';

interface VaultEntryFormProps {
  darkMode: boolean;
  entry?: VaultEntry;
  folders: string[];
  onSave: (entry: Partial<VaultEntry>) => void;
  onCancel: () => void;
  onGeneratePassword?: () => string;
}

export default function VaultEntryForm({
  darkMode,
  entry,
  folders,
  onSave,
  onCancel,
  onGeneratePassword,
}: VaultEntryFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(entry?.title ?? '');
  const [siteUrl, setSiteUrl] = useState(entry?.siteUrl ?? '');
  const [username, setUsername] = useState(entry?.username ?? '');
  const [password, setPassword] = useState(entry?.password ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [folder, setFolder] = useState(entry?.folder ?? 'General');
  const [tagsInput, setTagsInput] = useState(entry?.tags.join(', ') ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      setError(t.vaultFormTitleRequired);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      siteUrl: siteUrl.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      folder,
      tags,
    });
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (onGeneratePassword) {
      setPassword(onGeneratePassword());
    }
  };

  const inputClasses = `w-full px-3 py-2.5 rounded-lg text-sm transition-all ${darkMode ? 'bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-blue-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`;
  const labelClasses = `text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {entry ? t.vaultFormEditTitle : t.vaultFormAddTitle}
      </h3>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}

      {/* Title */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormTitle} *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          className={inputClasses}
          placeholder={t.vaultFormTitlePlaceholder}
          autoFocus
        />
      </div>

      {/* URL */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormUrl}</label>
        <input
          type="url"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          className={inputClasses}
          placeholder={t.vaultFormUrlPlaceholder}
        />
      </div>

      {/* Username */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormUsername}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClasses}
          placeholder={t.vaultFormUsernamePlaceholder}
        />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormPassword}</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClasses} pr-20`}
              placeholder="••••••••"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`p-1 rounded ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                onClick={() => void handleCopyPassword()}
                className={`p-1 rounded ${copied ? 'text-emerald-400' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          {onGeneratePassword && (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all whitespace-nowrap"
            >
              {t.vaultFormGenerate}
            </button>
          )}
        </div>
      </div>

      {/* Folder */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormFolder}</label>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className={inputClasses}
        >
          {folders.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormTags}</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={inputClasses}
          placeholder={t.vaultFormTagsPlaceholder}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className={labelClasses}>{t.vaultFormNotes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${inputClasses} resize-none`}
          placeholder={t.vaultFormNotesPlaceholder}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
        >
          {entry ? t.vaultFormUpdate : t.vaultFormSave}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {t.vaultFormCancel}
        </button>
      </div>
    </div>
  );
}
