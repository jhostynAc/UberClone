// AI-assisted: see docs/AI_LOG.md #24
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import es from './es.json';
import en from './en.json';

// 1. Agrupamos los diccionarios importados
const resources = {
  es: { translation: es },
  en: { translation: en }
};

// 2. Inicializamos i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    // Detecta el idioma del dispositivo (ej: 'es' o 'en')
    lng: Localization.getLocales()[0].languageCode,
    // Idioma por defecto si el usuario tiene su celular en un idioma no soportado (ej: francés)
    fallbackLng: 'es', 
    interpolation: {
      escapeValue: false, // React Native ya protege contra inyecciones XSS por defecto
    },
  });

export default i18n;