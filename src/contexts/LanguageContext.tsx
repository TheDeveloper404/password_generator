import { createContext, useContext } from 'react';
import { Language, Translations, translations } from '../utils/i18n';

interface LanguageContextValue {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ro',
  t: translations.ro,
  setLang: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  return useContext(LanguageContext);
}
