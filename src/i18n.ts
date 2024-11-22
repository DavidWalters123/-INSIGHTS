import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations directly in the code for WebContainer compatibility
const resources = {
  en: {
    common: {
      navigation: {
        home: 'Home',
        communities: 'Communities',
        courses: 'Courses',
        profile: 'Profile',
        settings: 'Settings'
      },
      actions: {
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        join: 'Join',
        leave: 'Leave',
        invite: 'Invite'
      }
    },
    auth: {
      signIn: 'Sign in',
      signOut: 'Sign out',
      signUp: 'Sign up'
    }
  },
  es: {
    common: {
      navigation: {
        home: 'Inicio',
        communities: 'Comunidades',
        courses: 'Cursos',
        profile: 'Perfil',
        settings: 'Ajustes'
      },
      actions: {
        create: 'Crear',
        edit: 'Editar',
        delete: 'Eliminar',
        save: 'Guardar',
        cancel: 'Cancelar',
        close: 'Cerrar',
        join: 'Unirse',
        leave: 'Salir',
        invite: 'Invitar'
      }
    },
    auth: {
      signIn: 'Iniciar sesión',
      signOut: 'Cerrar sesión',
      signUp: 'Registrarse'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      order: ['navigator', 'localStorage'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    }
  });

// Save language preference to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
});

export default i18n;