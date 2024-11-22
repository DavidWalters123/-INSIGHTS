import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      // Order of language detection - browser first, then localStorage
      order: ['navigator', 'localStorage', 'htmlTag'],
      // Cache language selection in localStorage
      caches: ['localStorage'],
      // Look for language in HTML lang attribute
      lookupFromPathIndex: 0,
      // Convert language to more specific if available (e.g., 'en' -> 'en-US')
      convertDetectedLanguage: (lng) => lng,
      // Automatically detect changes to browser language
      checkWhitelist: true
    },

    backend: {
      // Load translations from Google Translate API
      loadPath: 'https://translation.googleapis.com/language/translate/v2?key={{apiKey}}&q={{key}}&target={{lng}}',
      // Allow cross-origin requests
      crossDomain: true,
      // Parse response from Google Translate
      parse: (data) => {
        return JSON.parse(data).data.translations[0].translatedText;
      },
      // Add API key to requests
      requestOptions: {
        mode: 'cors',
        credentials: 'same-origin',
        cache: 'default'
      }
    }
  });

export default i18n;