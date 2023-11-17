import { ComponentProps, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { MethodEnum, OfferParams } from '~/types/extension'

import { IPopupPageProps } from '../types'
import TransactionInfo from './transactionInfo'

function offerInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const { t } = useTranslation()

    const assets = useMemo<
        ComponentProps<typeof TransactionInfo>['assets']
    >(() => {
        if (!request.data?.params) {
            return []
        }
        const { requestAssets, offerAssets } = request.data
            .params as OfferParams

        return [
            ...requestAssets.map((asset) => ({
                ...asset,
            })),
            ...offerAssets.map((asset) => ({
                ...asset,
                amount: -asset.amount,
            })),
        ]
    }, [])

    return <TransactionInfo title={t('offer')} assets={assets} />
}

export default offerInfo
