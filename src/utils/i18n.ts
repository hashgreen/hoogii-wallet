import { formatDuration as _formatDuration, Locale } from 'date-fns'
import { enUS, zhCN, zhTW } from 'date-fns/locale'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { LocaleEnum } from '~/types/i18n'
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

interface ILangItem {
    locale: keyof typeof LocaleEnum
    file: Locale
}

export const langItems: ILangItem[] = [
    {
        locale: 'en',
        file: enUS,
    },
    {
        locale: 'zh-tw',
        file: zhTW,
    },
    {
        locale: 'zh-ch',
        file: zhCN,
    },
]

export const getDateFnsLocale = (locale: string) => {
    return langItems.find((item) => item.locale === locale)?.file
}

export const formatDuration = (
    _seconds: number,
    locale: string,
    options?: Parameters<typeof _formatDuration>[1]
) => {
    const days = Math.floor(_seconds / (3600 * 24))
    const hours = Math.floor((_seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((_seconds % 3600) / 60)
    const seconds = Math.floor(_seconds % 60)
    return _formatDuration(
        _seconds ? { days, hours, minutes, seconds } : { seconds },
        { ...options, locale: getDateFnsLocale(locale), zero: !_seconds }
    )
}
