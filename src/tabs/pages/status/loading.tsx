import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmit } from 'react-router-dom'

import LoadingComponent from '~/components/Loading'
import { SubLayout } from '~tabs/layout'

const Loading = () => {
    const { t } = useTranslation()
    const submit = useSubmit()

    useEffect(() => {
        submit({}, { method: 'post' })
    }, [])

    return (
        <SubLayout back={false}>
            <LoadingComponent className="absolute-center">
                {t('status-creating')}
            </LoadingComponent>
        </SubLayout>
    )
}

export default observer(Loading)
