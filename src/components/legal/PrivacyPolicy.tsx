import { X, Shield } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface PrivacyPolicyProps {
  darkMode: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ darkMode, onClose }: PrivacyPolicyProps) {
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
              darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Shield size={16} className="text-blue-500" />
            </div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyTitle}
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
            {t.privacyLastUpdated}
          </p>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyIntroTitle}
            </h3>
            <p>{t.privacyIntroText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyDataTitle}
            </h3>
            <p>{t.privacyDataText}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t.privacyDataItem1}</li>
              <li>{t.privacyDataItem2}</li>
              <li>{t.privacyDataItem3}</li>
              <li>{t.privacyDataItem4}</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyEncryptionTitle}
            </h3>
            <p>{t.privacyEncryptionText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyStorageTitle}
            </h3>
            <p>{t.privacyStorageText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyRightsTitle}
            </h3>
            <p>{t.privacyRightsText}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t.privacyRightsItem1}</li>
              <li>{t.privacyRightsItem2}</li>
              <li>{t.privacyRightsItem3}</li>
              <li>{t.privacyRightsItem4}</li>
            </ul>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyCookiesTitle}
            </h3>
            <p>{t.privacyCookiesText}</p>
          </section>

          <section>
            <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.privacyContactTitle}
            </h3>
            <p>{t.privacyContactText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
