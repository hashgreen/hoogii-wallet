import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import rootStore from '~/store'
import { MethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'

function transferInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

    const finsAssetName = availableAssets?.data?.find(
        (availableAsset) =>
            request?.data?.params.assetId === availableAsset.asset_id
    )?.name

    const mojoToBalance = useCallback(
        (amount) => {
            if (request?.data?.params.assetId) {
                return mojoToCat(amount)
            } else {
                return mojoToXch(amount)
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
                        <div>{finsAssetName || XCH.code}</div>
                        <div className={'text-status-send'}>
                            -{request?.data?.params.amount}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default observer(transferInfo)
