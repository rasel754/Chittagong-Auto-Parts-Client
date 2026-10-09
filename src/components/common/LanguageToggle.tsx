import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'bn';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-background/80 hover:bg-accent text-xs font-semibold text-foreground transition-colors shadow-sm ${className}`}
      title={currentLang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
    >
      <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span>{currentLang === 'bn' ? 'বাংলা' : 'English'}</span>
    </button>
  );
};
