import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import controller from '../controller'

const Locked = () => {
    const { t } = useTranslation()
    const [password, setPassword] = useState('')

    const [error, setError] = useState<string>()
    const { checkPassword } = controller

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault()
                const isValid = await checkPassword(password)
                if (!isValid) setError(t('error-password-incorrect'))
            }}
        >
            Locked
            <input
                type="password"
                placeholder={t('input-password-placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={classNames('input', error && 'input-error')}
            />
            {error && (
                <div className="mt-2 font-medium text-center text-caption text-error">
                    {error}
                </div>
            )}
            <button type="submit" className="btn btn-CTA_landing">
                Unlock
            </button>
        </form>
    )
}

export default observer(Locked)
