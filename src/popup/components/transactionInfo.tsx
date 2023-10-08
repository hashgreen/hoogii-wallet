import { t } from 'i18next'
import { observer } from 'mobx-react-lite'
import { ReactNode } from 'react'

import AssetIcon from '~/components/AssetIcon'
import rootStore from '~/store'
import { OfferAsset } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToBalance, mojoToXch } from '~/utils/CoinConverter'

interface IAssetItemProps extends Omit<OfferAsset, 'memo'> {}

export const AssetItem = observer(({ assetId, amount }: IAssetItemProps) => {
    const {
        assetsStore: { XCH, getAssetByAssetId },
    } = rootStore
    const amountDisplay = mojoToBalance(Math.abs(amount), assetId)
    const className = amount >= 0 ? 'text-status-receive' : 'text-status-send'
    const foundAsset = getAssetByAssetId(assetId ?? XCH.assetId)

    return (
        <div className="flex-row-center justify-between text-body1">
            <div className="flex-row-center gap-1">
                <AssetIcon
                    src={foundAsset?.iconUrl}
                    assetId={assetId || XCH.assetId}
                    className="w-6 h-6"
                />
                {foundAsset?.code || `CAT ${shortenHash(assetId)}`}
            </div>
            <div className={className}>{`${
                amount >= 0 ? '+' : '-'
            }${amountDisplay}`}</div>
        </div>
    )
})

export const FeeInfo = observer(({ fee }: { fee: number }) => {
    const {
        assetsStore: { XCH },
    } = rootStore
    return (
        <div className="info-box">
            <span className="flex-row-center gap-1">
                <AssetIcon
                    src={XCH.iconUrl}
                    assetId={XCH.assetId}
                    className="w-6 h-6"
                />
                {XCH.code}
            </span>
            <span className="text-status-send">
                -{mojoToXch(fee).toString()}
            </span>
        </div>
    )
})

interface IProps {
    title: ReactNode
    assets: IAssetItemProps[]
}

const TransactionInfo = ({ title, assets }: IProps) => {
    return (
        <div className="flex flex-col gap-2 text-body2 text-primary-100">
            {t('transaction')}
            <div className="info-box flex-col items-stretch py-4 gap-2">
                <div className="text-body3 capitalize text-primary-100">
                    {title}
                </div>
                {assets.map((asset) => {
                    const key = `${asset.assetId}-${asset.amount}`

                    return <AssetItem key={key} {...asset} />
                })}
            </div>
        </div>
    )
}

export default TransactionInfo
