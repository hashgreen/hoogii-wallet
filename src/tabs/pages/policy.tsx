import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { isDev } from '~/utils/env'
import { SubLayout } from '~tabs/layout'

const Policy = ({ routeFor }: { routeFor: 'create' | 'import' }) => {
    const { t } = useTranslation()
    const [accepted, setAccepted] = useState(isDev)

    return (
        <SubLayout
            title={
                routeFor === 'create'
                    ? t('create-policy-title')
                    : t('import-policy-title')
            }
            next={{
                text: t('btn-next'),
                to: accepted ? `/mnemonic/${routeFor}` : undefined,
            }}
        >
            <ReactMarkdown
                className="pt-5"
                components={{
                    a: (props) => (
                        <a className="text-active" {...props} target="_blank" />
                    ),
                    ul: (props) => (
                        <ul className="list-disc pl-[1em]" {...props} />
                    ),
                }}
                remarkPlugins={[remarkGfm]}
            >
                {t('policy-description')}
            </ReactMarkdown>
            <label
                htmlFor="private-policy"
                className={classNames(
                    'mt-6 gap-2 flex-row-center',
                    !accepted && 'text-primary-100'
                )}
            >
                <input
                    type="checkbox"
                    name="private-policy"
                    id="private-policy"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.currentTarget.checked)}
                />
                <span>{t('policy-accept')}</span>
            </label>
        </SubLayout>
    )
}

export default observer(Policy)
