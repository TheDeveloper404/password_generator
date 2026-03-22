import { useState } from 'react';
import { FileText, CheckSquare, Square, Shield } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsConditions from '../legal/TermsConditions';

interface TermsAcceptanceModalProps {
  darkMode: boolean;
  onAccepted: () => void;
}

export default function TermsAcceptanceModal({ darkMode, onAccepted }: TermsAcceptanceModalProps) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleContinue = () => {
    if (!accepted) return;
    // Persist acceptance
    localStorage.setItem('pg_terms_accepted', 'true');
    onAccepted();
  };

  return (
    <>
      <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-5 ${
          darkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className="text-center space-y-3">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${
              darkMode ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <Shield size={28} className="text-green-500" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsModalTitle}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.termsModalDesc}
            </p>
          </div>

          {/* Links to legal pages */}
          <div className="space-y-2">
            <button
              onClick={() => setShowPrivacy(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                darkMode
                  ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Shield size={18} className="text-blue-500 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">{t.footerPrivacy}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.termsModalReadPrivacy}</p>
              </div>
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                darkMode
                  ? 'border-gray-700 hover:bg-gray-800 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FileText size={18} className="text-purple-500 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">{t.footerTerms}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.termsModalReadTerms}</p>
              </div>
            </button>
          </div>

          {/* Checkbox */}
          <button
            onClick={() => setAccepted(!accepted)}
            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
              accepted
                ? darkMode
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-green-400 bg-green-50'
                : darkMode
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {accepted ? (
              <CheckSquare size={20} className="text-green-500 mt-0.5 shrink-0" />
            ) : (
              <Square size={20} className={`mt-0.5 shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            )}
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.termsModalCheckbox}
            </span>
          </button>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!accepted}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
          >
            {t.termsModalContinue}
          </button>
        </div>
      </div>

      {showPrivacy && (
        <PrivacyPolicy darkMode={darkMode} onClose={() => setShowPrivacy(false)} />
      )}
      {showTerms && (
        <TermsConditions darkMode={darkMode} onClose={() => setShowTerms(false)} />
      )}
    </>
  );
}
