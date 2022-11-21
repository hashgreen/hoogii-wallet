import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { ImgHTMLAttributes, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import Messaging from '~/api/extension/messaging'
import PublicRouteLayout from '~/layouts/PublicRoute'
import rootStore from '~/store'
import { MethodEnum, SenderEnum } from '~/types/extension'

const HaloImg = (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <div className="relative">
        <img {...props} />
        <div
            className="w-[168px] h-[60px] rounded-[50%/50%] bg-white
            absolute bottom-1 left-1/2 -translate-x-1/2
            mix-blend-soft-light bg-blend-soft-light blur-[60px]"
        ></div>
    </div>
)

export const WelcomeBack = observer(() => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [isValid, setIsValid] = useState<boolean>(false)
    const [error, setError] = useState<string>()
    const [params] = useSearchParams()
    const {
        walletStore: { checkPassword },
    } = rootStore

    const resetPassword = () => {
        Messaging.toBackground<MethodEnum.RESET_PASSWORD>({
            sender: SenderEnum.EXTENSION,
            origin: chrome.runtime.getURL(''),
            method: MethodEnum.RESET_PASSWORD,
        })
    }

    return (
        <PublicRouteLayout back={false}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    const isValid = await checkPassword(password)
                    setIsValid(isValid)
                    if (isValid) navigate('/')
                    else setError(t('error-password-incorrect'))
                }}
                className="h-full pt-[116px] pb-5 flex-col-center"
            >
                <HaloImg src="/images/img_welcome.png" alt="welcome back" />
                <span className="mt-2 text-center text-body1 text-primary-100">
                    {params.get('description') ?? t('welcome_back-description')}
                </span>
                <div>
                    <input
                        type="password"
                        placeholder={t('input-password-placeholder')}
                        value={password}
                        onChange={(e) => {
                            if (!isValid) {
                                setIsValid(false)
                                setError(undefined)
                            }
                            setPassword(e.currentTarget.value)
                        }}
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
})

export default WelcomeBack
