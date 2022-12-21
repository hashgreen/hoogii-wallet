import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import Messaging from '~/api/extension/messaging'
import HaloImg from '~/components/HaloImg'
import PublicRouteLayout from '~/layouts/PublicRoute'
import { MethodEnum, SenderEnum } from '~/types/extension'

import controller from '../controller'

const Locked = () => {
    const { t } = useTranslation()
    const [password, setPassword] = useState('')
    const location = useLocation()

    const [error, setError] = useState<string>()
    const { checkPassword } = controller
    const resetPassword = async () => {
        await Messaging.toBackground<MethodEnum.RESET_PASSWORD>({
            sender: SenderEnum.EXTENSION,
            origin: chrome.runtime.getURL(''),
            method: MethodEnum.RESET_PASSWORD,
        })

        window.close()
    }

    return (
        <PublicRouteLayout back={false}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    const isValid = await checkPassword(password)
                    if (!isValid) {
                        setError(t('error-password-incorrect'))
                    }
                    if (isValid && location.pathname === '/') {
                        window.close()
                    }
                }}
                className="h-full pt-[116px] pb-12 flex-col-center scroll-di"
            >
                <HaloImg src="/images/img_welcome.png" alt="welcome back" />
                <span className="mt-2 text-center text-body1 text-primary-100">
                    {t('welcome_back-description')}
                </span>
                <div>
                    <input
                        type="password"
                        placeholder={t('input-password-placeholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={classNames(
                            'mt-10 input input-landing w-[280px]',
                            error && 'input-error'
                        )}
                    />
                    {error && (
                        <div className="mt-2 font-medium text-center text-caption text-error">
                            {error}
                        </div>
                    )}
                </div>
                <div className="grow"></div>
                <button
                    type="submit"
                    className="btn btn-CTA_landing btn-large mb-7 w-[200px]"
                    disabled={!password}
                >
                    {t('btn-unlock')}
                </button>
                <button
                    type={'button'}
                    onClick={resetPassword}
                    className="capitalize text-body2 text-active"
                >
                    {t('btn-forgot_password')}
                </button>
            </form>
        </PublicRouteLayout>
    )
}

export default observer(Locked)
