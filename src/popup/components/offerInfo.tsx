import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AssetIcon from '~/components/AssetIcon'
import rootStore from '~/store'
import {
    MethodEnum,
    OfferAsset,
    OfferParams,
    OfferTypeEnum,
} from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToBalance } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'

interface IOfferAssets extends OfferAsset {
    offerType: OfferTypeEnum
}

function offerInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const { t } = useTranslation()

    const {
        assetsStore: { XCH, getAssetByAssetId },
        walletStore: { address },
    } = rootStore

    const shortenAddress = shortenHash(address)

    const offerAssets = useMemo<IOfferAssets[]>(() => {
        if (!request.data?.params) {
            return []
        }
        const { requestAssets, offerAssets } = request.data
            .params as OfferParams

        return [
            ...requestAssets.map((asset) => ({
                ...asset,
                offerType: OfferTypeEnum.REQUEST,
            })),
            ...offerAssets.map((asset) => ({
                ...asset,
                offerType: OfferTypeEnum.OFFER,
            })),
        ]
    }, [request.data?.params])
    return (
        <>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    {t('address')}
                </div>
                <div className="flex flex-col gap-1 px-2 py-2 rounded-sm cursor-pointer bg-box shrink ">
                    {shortenAddress}
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    {t('transaction')}
                </div>
                <div className="flex flex-col gap-1 px-2 py-3 rounded-sm cursor-pointer bg-box shrink ">
                    <div className="text-left text-caption text-primary-100">
                        {t('offer')}
                    </div>
                    {offerAssets.map((asset) => {
                        const amount = mojoToBalance(
                            asset.amount.toString(),
                            asset.assetId
                        )
                        const foundAsset = getAssetByAssetId(
                            asset.assetId ?? XCH.assetId
                        )

                        return (
                            <div
                                className="flex-row-center justify-between mb-1"
                                key={asset.assetId}
                            >
                                <div className="flex-row-center">
                                    <AssetIcon
                                        src={foundAsset?.iconUrl}
                                        assetId={asset.assetId || XCH.assetId}
                                        className="w-6 h-6 mr-1"
                                    />
                                    {foundAsset?.code ||
                                        `CAT ${shortenHash(asset.assetId)}`}
                                </div>
                                <div
                                    className={`${
                                        asset.offerType ===
                                        OfferTypeEnum.REQUEST
                                            ? 'text-status-receive'
                                            : 'text-status-send'
                                    }`}
                                >
                                    {asset.offerType === OfferTypeEnum.REQUEST
                                        ? '+'
                                        : '-'}
                                    {amount}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default observer(offerInfo)
