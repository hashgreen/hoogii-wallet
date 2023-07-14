import { t } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { JsonView } from 'react-json-view-lite'

import { getParseSpendBundle } from '~/api/api'
import AssetIcon from '~/components/AssetIcon'
import MemoDisplay from '~/components/Transaction/MemoDisplay'
import rootStore from '~/store'
import { ITransaction } from '~/types/api'
import { MethodEnum, RequestMethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToBalance } from '~/utils/CoinConverter'
import { add0x } from '~/utils/encryption'
import { puzzleHashToAddress } from '~/utils/signature'

import { IPopupPageProps } from '../types'
function spendBundleInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const [parseBundle, setParseBundle] = useState<ITransaction | undefined>()

    const { metadata } = parseBundle || {}

    const memos = useMemo(() => {
        if (metadata?.memos) {
            if (metadata?.asset_id) {
                return metadata?.memos?.slice(1)
            } else {
                return metadata?.memos
            }
        }

        return []
    }, [metadata])

    const {
        assetsStore: { XCH, availableAssets },
    } = rootStore

    const finsAsset = availableAssets?.data?.find(
        (availableAsset) => metadata?.asset_id === availableAsset.asset_id
    )
    const onGetParseSpendBundle = async (spendBundle) => {
        try {
            const res = await getParseSpendBundle({
                data: {
                    spend_bundle: spendBundle,
                },
            })
            setParseBundle(res?.data.data)
        } catch (error) {}
    }

    useEffect(() => {
        let spendBundle = {}

        if (request.data?.method === RequestMethodEnum.SIGN_COIN_SPENDS) {
            spendBundle = {
                coin_spends: request?.data?.params?.coinSpends,
                aggregated_signature: add0x(
                    'c' + Array(191).fill('0').join('')
                ),
            }
        }

        onGetParseSpendBundle(spendBundle)
    }, [request?.data?.params?.spendBundle])

    return (
        <div>
            {parseBundle ? (
                <>
                    <div>
                        <div className="mb-3 text-left text-caption text-primary-100">
                            {t('address')}
                        </div>
                        <div className="flex flex-col gap-1 px-2 py-2 rounded-sm cursor-pointer bg-box shrink ">
                            {shortenHash(
                                puzzleHashToAddress(
                                    metadata?.to_puzzle_hashes?.[0]
                                )
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="mt-2 mb-1 text-left text-caption text-primary-100">
                            {t('transaction')}
                        </div>
                        <div className="flex flex-col gap-1 px-2 py-3 rounded-sm bg-box shrink ">
                            <div className="text-left text-caption text-primary-100">
                                {t('send-title')}
                            </div>
                            <div className="flex-row-center justify-between mb-1">
                                <div className="flex-row-center">
                                    <AssetIcon
                                        src={finsAsset?.icon_url}
                                        assetId={
                                            metadata?.asset_id || XCH.assetId
                                        }
                                        className="w-6 h-6 mr-1"
                                    />

                                    {metadata?.asset_id
                                        ? finsAsset?.name ||
                                          `CAT ${shortenHash(
                                              metadata?.asset_id
                                          )}`
                                        : XCH.code}
                                </div>
                                <div className="text-status-send">
                                    -
                                    {mojoToBalance(
                                        parseBundle.metadata?.amount || 0,
                                        parseBundle?.metadata.asset_id
                                    )}
                                </div>
                            </div>
                        </div>

                        {memos.length > 0 && (
                            <>
                                <div className="mt-2 mb-1 text-left text-caption text-primary-100">
                                    {t('transaction-memo')}
                                </div>
                                <div className="flex flex-col gap-1 px-2 py-3 rounded-sm bg-box shrink">
                                    {memos?.map((memo, index) => (
                                        <MemoDisplay
                                            key={`${index}-${memo}`}
                                            id="spendBundleInfo"
                                            memo={memo}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="mt-2 mb-1 text-left text-caption text-primary-100">
                            {t('fee')}
                        </div>
                        <div className="flex flex-col gap-1 px-2 py-2 rounded-sm bg-box shrink">
                            <div className="flex flex-row justify-between">
                                <div className="flex">
                                    <AssetIcon
                                        assetId={''}
                                        className="w-6 h-6 mr-1"
                                    />

                                    {XCH.code}
                                </div>
                                <div className="text-status-send">
                                    -{mojoToBalance(parseBundle.fee || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-2 text-left text-caption text-primary-100">
                        {t('send-transaction-spend-bundle')}
                    </div>
                    <div className="flex flex-col gap-1 px-2 py-3 rounded-sm cursor-pointer bg-box shrink ">
                        <div className="text-caption text-primary-100 h-[180px] overflow-y-auto">
                            <JsonView
                                data={
                                    request?.data?.params?.spendBundle ||
                                    request?.data?.params?.coinSpends
                                }
                                shouldInitiallyExpand={() => true}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
export default spendBundleInfo
