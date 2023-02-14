import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

import AssetIcon from '~/components/AssetIcon'
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
                    Address
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-2 shrink cursor-pointer rounded-sm ">
                    {shortenAddress}
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    Transaction
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink cursor-pointer rounded-sm ">
                    <div className="text-left text-caption text-primary-100">
                        Offer
                    </div>
                    {offerAssets.map((asset) => {
                        const amount = asset.assetId
                            ? mojoToCat(asset.amount.toString()).toFixed(3)
                            : mojoToXch(asset.amount.toString()).toFixed(12)

                        const finsAsset = availableAssets?.data?.find(
                            (availableAsset) =>
                                availableAsset.asset_id === asset.assetId
                        )

                        return (
                            <div
                                className="flex mb-1 flex-row justify-between"
                                key={asset.assetId}
                            >
                                <div className="flex">
                                    <AssetIcon
                                        src={finsAsset?.icon_url}
                                        assetId={asset.assetId || 'XCH'}
                                        className="mr-1 w-6 h-6"
                                    />
                                    {asset.assetId
                                        ? finsAsset?.name ||
                                          `CAT ${shortenHash(asset.assetId)}`
                                        : XCH.code}
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
