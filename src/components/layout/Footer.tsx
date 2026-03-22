import { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import PrivacyPolicy from '../legal/PrivacyPolicy';
import TermsConditions from '../legal/TermsConditions';

interface FooterProps {
  darkMode: boolean;
}

export default function Footer({ darkMode }: FooterProps) {
  const { t } = useTranslation();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className={`w-full py-3 px-4 text-center text-[11px] border-t ${
        darkMode
          ? 'border-gray-800 text-gray-500 bg-gray-950/50'
          : 'border-gray-200 text-gray-400 bg-gray-50/50'
      }`}>
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
          <span>
            Powered by{' '}
            <a
              href="https://acl-smartsoftware.ro"
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold transition-colors ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              @ACL Smart Software
            </a>
          </span>
          <span className={`hidden sm:inline ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>·</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrivacy(true)}
              className={`underline-offset-2 hover:underline transition-colors ${
                darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'
              }`}
            >
              {t.footerPrivacy}
            </button>
            <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>|</span>
            <button
              onClick={() => setShowTerms(true)}
              className={`underline-offset-2 hover:underline transition-colors ${
                darkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'
              }`}
            >
              {t.footerTerms}
            </button>
          </div>
        </div>
      </footer>

      {showPrivacy && (
        <PrivacyPolicy darkMode={darkMode} onClose={() => setShowPrivacy(false)} />
      )}
      {showTerms && (
        <TermsConditions darkMode={darkMode} onClose={() => setShowTerms(false)} />
      )}
    </>
  );
}
