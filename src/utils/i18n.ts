import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
    // detect user language
    .use(Backend)
    // // pass the i18n instance to react-i18next.
    // .use(LanguageDetector)
    // init i18next
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        lowerCaseLng: true,
        fallbackLng: {
            // zh: ['zh-TW', 'zh-CN', 'en'],
            // es: ['es-419', 'fr', 'en'],
            default: ['en'],
        },
        debug: true,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    })

export default i18n
