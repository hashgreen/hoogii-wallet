import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import AssetIcon from '~/components/AssetIcon'
import rootStore from '~/store'
import { MethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'

function transferInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

    const finsAsset = availableAssets?.data?.find(
        (availableAsset) =>
            request?.data?.params.assetId === availableAsset.asset_id
    )

    const mojoToBalance = useCallback(
        (amount) => {
            if (request?.data?.params.assetId) {
                return mojoToCat(amount).toFixed(3).toString()
            } else {
                return mojoToXch(amount).toFixed(12).toString()
            }
        },
        [request?.data?.params.assetId]
    )

    return (
        <>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    Address
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-2 shrink cursor-pointer rounded-sm ">
                    {shortenHash(request?.data?.params.to)}
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    Transaction
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink cursor-pointer rounded-sm ">
                    <div className="text-left text-caption text-primary-100">
                        Send
                    </div>
                    <div className="flex mb-1 flex-row justify-between">
                        <div className="flex">
                            <AssetIcon
                                src={finsAsset?.icon_url}
                                assetId={request?.data?.params.assetId || 'XCH'}
                                className="mr-1 w-6 h-6"
                            />

                            {request?.data?.params.assetId
                                ? finsAsset?.name ||
                                  `CAT ${shortenHash(
                                      request?.data?.params.assetId
                                  )}`
                                : XCH.code}
                        </div>
                        <div className={'text-status-send'}>
                            -{mojoToBalance(request?.data?.params.amount)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default observer(transferInfo)
