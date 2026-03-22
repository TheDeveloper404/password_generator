import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { importCSV, getImportSources, type ImportSource, type ImportResult } from '../../utils/importCsvUtils';
import type { VaultEntry } from '../../types/vault';

interface ImportCsvDialogProps {
  darkMode: boolean;
  onImport: (entries: Partial<VaultEntry>[]) => void;
  onClose: () => void;
}

export default function ImportCsvDialog({ darkMode, onImport, onClose }: ImportCsvDialogProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<ImportSource>('auto');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const sources = getImportSources();

  const handleFile = async (file: File) => {
    try {
      setError(null);
      setFileName(file.name);
      const text = await file.text();
      const parsed = importCSV(text, source);

      if (parsed.entries.length === 0) {
        setError(t.csvNoEntries);
        setResult(null);
        return;
      }

      setResult(parsed);
    } catch {
      setError(t.csvParseError);
      setResult(null);
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onImport(result.entries);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
            <Upload size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.csvTitle}
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {t.csvDesc}
            </p>
          </div>
        </div>

        {/* Source selector */}
        <div className="space-y-1.5">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t.csvSource}
          </label>
          <div className="relative">
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value as ImportSource);
                setResult(null);
                setError(null);
              }}
              className={`w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
                darkMode
                  ? 'border-gray-600 bg-gray-700/50 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-900'
              }`}
            >
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === 'auto' ? t.csvAutoDetect : s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            darkMode
              ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileText className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={28} />
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {fileName || t.csvSelectFile}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.csvFileHint}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Preview result */}
        {result && (
          <div className={`rounded-xl p-4 space-y-3 ${darkMode ? 'bg-gray-700/30 border border-gray-700/50' : 'bg-gray-50 border border-gray-200/80'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t.csvPreviewTitle}
              </span>
            </div>
            <div className={`grid grid-cols-2 gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div>{t.csvDetectedSource}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{result.source}</span></div>
              <div>{t.csvTotalRows}: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{result.total}</span></div>
              <div>{t.csvImportable}: <span className={`font-semibold text-emerald-500`}>{result.entries.length}</span></div>
              <div>{t.csvSkipped}: <span className={`font-semibold ${result.skipped > 0 ? 'text-amber-500' : darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{result.skipped}</span></div>
            </div>

            {/* Preview first 3 entries */}
            {result.entries.length > 0 && (
              <div className="space-y-1.5 mt-2">
                <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.csvPreview}:
                </span>
                {result.entries.slice(0, 3).map((entry, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-lg px-3 py-2 ${darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-white text-gray-700'}`}
                  >
                    <span className="font-semibold">{entry.title}</span>
                    {entry.username && <span className={`ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({entry.username})</span>}
                    {entry.siteUrl && <span className={`ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>— {entry.siteUrl}</span>}
                  </div>
                ))}
                {result.entries.length > 3 && (
                  <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    +{result.entries.length - 3} {t.csvMore}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              darkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t.vaultFormCancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!result || result.entries.length === 0}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              result && result.entries.length > 0
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/20'
                : darkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.csvImportButton} {result ? `(${result.entries.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
