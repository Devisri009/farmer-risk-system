import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import taTranslations from './locales/ta.json';

// Handle potential ESM default export
const en = enTranslations.default || enTranslations;
const ta = taTranslations.default || taTranslations;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en
            },
            ta: {
                translation: ta
            }
        },
        supportedLngs: ['en', 'ta'],
        fallbackLng: 'en',
        load: 'languageOnly',
        debug: true,

        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
