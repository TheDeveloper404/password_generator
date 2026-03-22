import { X, FileText } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface TermsConditionsProps {
  darkMode: boolean;
  onClose: () => void;
}

export default function TermsConditions({ darkMode, onClose }: TermsConditionsProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl border shadow-2xl overflow-hidden ${
        darkMode ? 'bg-gray-900 border-gray-700/50' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
          darkMode ? 'bg-gray-900/95 border-gray-700/50 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              darkMode ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <FileText size={16} className="text-purple-500" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsTitle}
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
        <div className={`px-6 py-5 overflow-y-auto max-h-[calc(85vh-80px)] text-sm leading-relaxed space-y-5 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.termsLastUpdated}
          </p>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsAcceptanceTitle}
            </h3>
            <p>{t.termsAcceptanceText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsServiceTitle}
            </h3>
            <p>{t.termsServiceText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsAccountTitle}
            </h3>
            <p>{t.termsAccountText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsSecurityTitle}
            </h3>
            <p>{t.termsSecurityText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsLiabilityTitle}
            </h3>
            <p>{t.termsLiabilityText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsTerminationTitle}
            </h3>
            <p>{t.termsTerminationText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsChangesTitle}
            </h3>
            <p>{t.termsChangesText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.termsContactTitle}
            </h3>
            <p>{t.termsContactText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
