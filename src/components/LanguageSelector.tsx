import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'pt', name: 'Português' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      document.documentElement.lang = languageCode;
      setShowDropdown(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
        title="Change Language"
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm hidden md:inline">{currentLanguage.name}</span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-surface border border-surface-light rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    i18n.language === language.code
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-300 hover:bg-surface-light'
                  }`}
                >
                  {language.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}