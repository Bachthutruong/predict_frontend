import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = useCallback((language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
  }, [i18n]);

  const currentLanguage = useMemo(() => i18n.language, [i18n.language]);

  const availableLanguages = useMemo(() => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
  ], []);

  return {
    t,
    changeLanguage,
    currentLanguage,
    availableLanguages
  };
}; 