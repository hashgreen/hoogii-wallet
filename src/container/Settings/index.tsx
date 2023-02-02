import { Listbox } from '@headlessui/react'
import classNames from 'classnames'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useClosablePage } from '~/layouts/ClosablePage'
import { isDev } from '~/utils'
import BottomIcon from '~icons/hoogii/bottom.jsx'
import DarkIcon from '~icons/hoogii/dark.jsx'
import LightIcon from '~icons/hoogii/light.jsx'
import RightIcon from '~icons/hoogii/right.jsx'
import UpIcon from '~icons/hoogii/up.jsx'

interface ILanguageItem {
    title: string
    code: string
    supported: boolean
}

const languages: ILanguageItem[] = [
    {
        title: 'English',
        code: 'en',
        supported: true,
    },
    {
        title: 'Chinese',
        code: 'zh-TW',
        supported: false,
    },
]

const Settings = () => {
    const { t } = useTranslation()
    useClosablePage(t('setting-title'), '/')
    const [language, setLanguage] = useState<ILanguageItem>(languages[0])
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    const toggleTheme = useCallback(() => {
        if (theme === 'light') setTheme('dark')
        else setTheme('light')
    }, [theme, setTheme])

    return (
        <div className="flex flex-col overflow-hidden grow">
            {isDev && (
                <div>
                    <span className="capitalize text-body3 text-primary-100">
                        {t('setting-language')}
                    </span>
                    <Listbox
                        value={language}
                        onChange={setLanguage}
                        as="div"
                        className="relative mt-2 mb-5"
                    >
                        <Listbox.Button
                            className={({ open }) =>
                                classNames(
                                    'justify-between h-10 pl-4 pr-2 w-full text-body3 rounded flex-row-center bg-box',
                                    open
                                        ? 'border-primary border-2'
                                        : 'border-primary/70 border'
                                )
                            }
                        >
                            {({ open }) => (
                                <>
                                    {language.title}
                                    {open ? (
                                        <UpIcon className="w-4 h-4 text-active" />
                                    ) : (
                                        <BottomIcon className="w-4 h-4 text-active" />
                                    )}
                                </>
                            )}
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 flex flex-col w-full gap-1 px-2 py-3 mt-2 border-2 rounded bg-box border-primary text-body3">
                            {languages.map((item) => (
                                <Listbox.Option
                                    key={item.code}
                                    value={item}
                                    disabled={!item.supported}
                                    className={({ active, selected }) =>
                                        classNames(
                                            'h-8 px-2 bg-white/5 flex-row-center rounded',
                                            (active || selected) &&
                                                'bg-white/20'
                                        )
                                    }
                                >
                                    {item.title}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Listbox>
                </div>
            )}
            {isDev && (
                <div>
                    <span className="capitalize text-body3 text-primary-100">
                        {t('setting-mode')}
                    </span>
                    <button
                        className="btn h-[30px] bg-white/5 hover:bg-white/20 mt-2 px-3 py-2 min-w-0 rounded text-button3 flex-row-center gap-2 capitalize"
                        onClick={toggleTheme}
                    >
                        {theme === 'dark' ? (
                            <>
                                {t('setting-mode-dark')}
                                <DarkIcon className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                {t('setting-mode-light')}
                                <LightIcon className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
            {isDev && <hr className="border-primary/30 my-5" />}
            <ul>
                {[
                    {
                        title: t('setting-address_book'),
                        to: 'addressBook',
                    },
                    {
                        title: t('setting-connected_sites'),
                        to: 'connectedSites',
                    },
                    { title: t('setting-advance'), to: 'advance' },
                ].map((item) => (
                    <li key={item.title}>
                        <Link
                            to={item.to}
                            className="justify-between flex-row-center py-2.5 capitalize"
                        >
                            {item.title}
                            <RightIcon className="w-5 h-5 text-active" />
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="grow"></div>
            <div className="flex-col-center">
                <span className="text-center text-body2 text-primary-100">
                    {t('version_text', {
                        version: isDev
                            ? __APP_VERSION__
                            : __APP_VERSION__.split('-')[0],
                    })}
                </span>
            </div>
        </div>
    )
}

export default Settings
