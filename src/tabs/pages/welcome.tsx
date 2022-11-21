import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Welcome = () => {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center text-center">
            <img
                src="/images/logo.svg"
                alt="logo"
                className="mb-5 mt-20 w-[120px]"
            />
            <div className="w-full text-primary-100 mb-10">
                <div className="capitalize text-headline2 mb-3">
                    {t('welcome-title')}
                </div>
                {t('welcome-description')}
            </div>
            <Link
                to="/mnemonic/create/policy"
                className="w-full btn btn-large btn-CTA_landing"
            >
                {t('btn-new_wallet')}
            </Link>
            <Link
                to="/mnemonic/import/policy"
                className="w-full mt-4 btn btn-large btn-CTA_landing btn-outline"
            >
                {t('btn-import')}
            </Link>
        </div>
    )
}

export default Welcome
