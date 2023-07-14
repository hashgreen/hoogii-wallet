import { sanitizeHex } from '@rigidity/chia'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import AssetIcon from '~/components/AssetIcon'
import CopyTooltip from '~/components/CopyTooltip'
import rootStore from '~/store'
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
        assetsStore: { XCH, availableAssets, existedAssets },
    } = rootStore

    return (
        <>
            {assetBalances.map((assetBalance, index) => {
                const { assetId, amount } = assetBalance
                const existAsset = existedAssets.find(
                    (asset) => add0x(asset.assetId) === assetId
                )

                const finsAsset = availableAssets?.data?.find(
                    (availableAsset) =>
                        add0x(availableAsset.asset_id) === assetId
                )

                const name = existAsset?.code || finsAsset?.name

                return (
                    <div
                        className="flex justify-between items-center pt-1 select-none text-caption"
                        key={index}
                    >
                        <div className="flex items-center  leading-0">
                            <AssetIcon
                                src={finsAsset?.icon_url}
                                assetId={assetId}
                                className="w-6 h-6 mr-1"
                            />
                            <span className="text-dark-scale-100 ">
                                {assetId ? name || 'CAT ' : XCH.code}
                            </span>

                            {assetId && (
                                <CopyTooltip
                                    gaCategory={'activity'}
                                    dataTip={t('tooltip-copy_asset_id')}
                                    copiedDataTip={t('tooltip-copied')}
                                    value={sanitizeHex(assetId)}
                                    className="gap-1 ml-1 select-none w-min flex-row-center after:whitespace-nowrap "
                                >
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
