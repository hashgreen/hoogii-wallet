import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

import rootStore from '~/store'
import {
    MethodEnum,
    OfferAsset,
    OfferParams,
    OfferTypeEnum,
} from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'

interface IOfferAssets extends OfferAsset {
    offerType: OfferTypeEnum
}

function offerInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

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
            <div className="text-left text-caption text-primary-100">Offer</div>
            {offerAssets.map((asset) => {
                const amount = asset.assetId
                    ? mojoToCat(asset.amount.toString()).toFixed(3)
                    : mojoToXch(asset.amount.toString()).toFixed(12)

                const finsAssetName = availableAssets?.data?.find(
                    (availableAsset) =>
                        availableAsset.asset_id === asset.assetId
                )?.name

                return (
                    <div
                        className="flex mb-1 flex-row justify-between"
                        key={asset.assetId}
                    >
                        <div>
                            {asset.assetId
                                ? finsAssetName ||
                                  `CAT ${shortenHash(asset.assetId)}`
                                : XCH.code}
                        </div>
                        <div
                            className={`${
                                asset.offerType === OfferTypeEnum.REQUEST
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
        </>
    )
}

export default observer(offerInfo)
