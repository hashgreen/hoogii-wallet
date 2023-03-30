import { t } from 'i18next'
import { observer } from 'mobx-react-lite'

import AssetIcon from '~/components/AssetIcon'
import rootStore from '~/store'
import { MethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToBalance } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'

function transferInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

    const finsAsset = availableAssets?.data?.find(
        (availableAsset) =>
            request?.data?.params.assetId === availableAsset.asset_id
    )
    return (
        <>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    {t('address')}
                </div>
                <div className="flex flex-col gap-1 px-2 py-2 rounded-sm cursor-pointer bg-box shrink ">
                    {shortenHash(request?.data?.params.to)}
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    {t('transaction')}
                </div>
                <div className="flex flex-col gap-1 px-2 py-3 rounded-sm cursor-pointer bg-box shrink ">
                    <div className="text-left text-caption text-primary-100">
                        {t('send-title')}
                    </div>
                    <div className="flex flex-row justify-between mb-1">
                        <div className="flex">
                            <AssetIcon
                                src={finsAsset?.icon_url}
                                assetId={request?.data?.params.assetId || 'XCH'}
                                className="w-6 h-6 mr-1"
                            />

                            {request?.data?.params.assetId
                                ? finsAsset?.name ||
                                  `CAT ${shortenHash(
                                      request?.data?.params.assetId
                                  )}`
                                : XCH.code}
                        </div>
                        <div className={'text-status-send'}>
                            -
                            {mojoToBalance(
                                request?.data?.params.amount,
                                request?.data?.params.assetId
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default observer(transferInfo)
