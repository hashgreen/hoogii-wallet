import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { getStorage } from '~/utils/extension/storage'

import locale from '../../public/locales'
import { setStorage } from './extension/storage'
const initLang = async () => {
    const savedLang = await getStorage<string>('locale')
    if (!savedLang) {
        await setStorage({ locale: 'en' })
    }
    return savedLang || 'en'
}

i18n
    // // pass the i18n instance to react-i18next.// .use(LanguageDetector)
    // init i18next
    .use(initReactI18next)
    .init({
        lng: await initLang(),
        resources: {
            en: {
                translation: locale.en,
            },
            'zh-ch': {
                translation: locale.zhCh,
            },
            'zh-tw': {
                translation: locale.zhTw,
            },
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
