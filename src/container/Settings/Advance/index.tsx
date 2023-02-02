/* eslint-disable no-undef */
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Popup from '~/components/Popup'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { isDev } from '~/utils/env'
import RightIcon from '~icons/hoogii/right.jsx'

const Advance = () => {
    const { t } = useTranslation()
    useClosablePage(t('setting-advance'))
    const {
        walletStore: { logout },
    } = rootStore
    const [open, setOpen] = useState(false)
    return (
        <>
            <ul>
                {[
                    ...(isDev
                        ? [
                              {
                                  title: t(
                                      'setting-advance-feedback-menu-title'
                                  ),
                                  to: '/setting/advance/feedback',
                              },
                          ]
                        : []),
                    {
                        title: t('setting-advance-about_chia_cointset_model'),
                        to: 'https://docs.chia.net/docs/04coin-set-model/intro/',
                        external: true,
                    },
                ].map((item) => (
                    <li key={item.title}>
                        {item.external ? (
                            <a
                                href={item.to}
                                target="_blank"
                                rel="noreferrer"
                                className="justify-between flex-row-center py-2.5 capitalize"
                            >
                                {item.title}
                                <RightIcon className="w-5 h-5 text-active" />
                            </a>
                        ) : (
                            <Link
                                to={item.to}
                                className="justify-between flex-row-center py-2.5 capitalize"
                            >
                                {item.title}
                                <RightIcon className="w-5 h-5 text-active" />
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
            <div className="grow"></div>
            <div className="gap-5 flex-col-center">
                <button
                    className="min-w-0 btn btn-error btn-outline"
                    onClick={() => setOpen(true)}
                >
                    {t('btn-reset_wallet')}
                </button>
                <span className="text-center text-body2 text-primary-100">
                    {t('version_text', {
                        version: isDev
                            ? __APP_VERSION__
                            : __APP_VERSION__.split('-')[0],
                    })}
                </span>
            </div>
            {open && (
                <Popup
                    actionButton={
                        <button onClick={logout} className="btn btn-error">
                            {t('btn-reset')}
                        </button>
                    }
                    close={() => setOpen(false)}
                    className="text-center"
                >
                    <div>
                        <div className="mb-4 text-headline3">Reset Wallet</div>
                        <div className="text-body2 text-primary-100">
                            <p>
                                {t('setting-advance-reset_popup-description1')}
                            </p>
                            <br />
                            <p>
                                {t('setting-advance-reset_popup-description2')}
                            </p>
                        </div>
                    </div>
                </Popup>
            )}
        </>
    )
}

export default observer(Advance)
