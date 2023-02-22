import { useTranslation } from 'react-i18next'

import { isDev } from '~/utils/env'

import pkg from '../../package.json'
const Version = () => {
    const { t } = useTranslation()
    return (
        <span className="text-center text-body2 text-primary-100">
            {t('version_text', {
                version: isDev ? pkg.version : pkg.version.split('-')[0],
            })}
        </span>
    )
}

export default Version
