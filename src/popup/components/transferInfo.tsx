import { t } from 'i18next'
import { ComponentProps, useMemo } from 'react'

import { TransactionInfo } from '~/popup/components'
import { MethodEnum, TransferParams } from '~/types/extension'

import { IPopupPageProps } from '../types'

function transferInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const assets = useMemo<
        ComponentProps<typeof TransactionInfo>['assets']
    >(() => {
        if (!request.data?.params) {
            return []
        }
        const params = request.data.params as TransferParams

        return [
            {
                assetId: params.assetId,
                amount: -params.amount,
            },
        ]
    }, [])

    return <TransactionInfo title={t('send-title')} assets={assets} />
}

export default transferInfo
