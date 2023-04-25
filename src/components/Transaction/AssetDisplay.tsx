import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import AssetIcon from '~/components/AssetIcon'
import CopyTooltip from '~/components/CopyTooltip'
import rootStore from '~/store'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'
import { add0x } from '~/utils/encryption'
import CopyIcon from '~icons/hoogii/copy.jsx'

import { IAssetBalances } from './type'
const AssetDisplay = ({
    assetBalances,
}: {
    assetBalances: IAssetBalances[]
}) => {
    const { t } = useTranslation()
    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

    return (
        <>
            {assetBalances.map((assetBalance, index) => {
                const { assetId, amount } = assetBalance
                const finsAsset = availableAssets?.data?.find(
                    (availableAsset) =>
                        add0x(availableAsset.asset_id) === assetId
                )
                return (
                    <div
                        className="flex justify-between items-center pt-1 select-none text-caption"
                        key={index}
                    >
                        <div className="flex items-center">
                            <AssetIcon
                                src={finsAsset?.icon_url}
                                assetId={assetId || 'XCH'}
                                className="w-6 h-6 mr-1"
                            />
                            {assetId ? finsAsset?.name || 'CAT ' : XCH.code}

                            {assetId && (
                                <CopyTooltip
                                    gaCategory={'activity'}
                                    dataTip={t('tooltip-copy_asset_id')}
                                    copiedDataTip={t('tooltip-copied')}
                                    value={assetId}
                                    className="gap-1 ml-1 select-none text-dark-scale-100 w-min flex-row-center after:whitespace-nowrap "
                                >
                                    {shortenHash(assetId)}
                                    <CopyIcon className="w-3 h-3" />
                                </CopyTooltip>
                            )}
                        </div>
                        <div
                            className={`${classNames({
                                'text-status-receive': Number(amount) >= 0,
                                'text-status-send': Number(amount) < 0,
                            })}`}
                        >
                            {!assetId
                                ? mojoToXch(amount?.toString() ?? '0').toFixed()
                                : mojoToCat(
                                      amount?.toString() ?? '0'
                                  ).toFixed()}
                        </div>
                    </div>
                )
            })}
        </>
    )
}

AssetDisplay.propTypes = {}

export default AssetDisplay
