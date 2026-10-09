import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { bnTranslations } from './bn';
import { enTranslations } from './en';

const savedLanguage = (localStorage.getItem('cap_language') as 'bn' | 'en') || 'bn';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      bn: {
        translation: bnTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: savedLanguage,
    fallbackLng: 'bn',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('cap_language', lng);
  document.documentElement.lang = lng;
});

// Set document html lang initially
document.documentElement.lang = savedLanguage;

export default i18n;
