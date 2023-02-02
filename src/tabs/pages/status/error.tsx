import { useTranslation } from 'react-i18next'

import { isDev } from '~/utils/env'
import { SubLayout } from '~tabs/layout'

export const Error = () => {
    const { t } = useTranslation()
    return (
        <SubLayout back={false}>
            <div className="pt-[116px] flex-col-center">
                <img
                    src="/images/img_error.png"
                    alt="error"
                    className="w-min"
                />
                <span className="mt-4 text-center text-body1 text-primary-100">
                    {t('status-error-description')}
                </span>
                <button
                    onClick={() =>
                        isDev ? (window.location.href = '/') : window.close()
                    }
                    className="mt-[60px] btn btn-CTA_landing btn-outline btn-large w-[200px]"
                >
                    {t('btn-close')}
                </button>
            </div>
        </SubLayout>
    )
}

export default Error
