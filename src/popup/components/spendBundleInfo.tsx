import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { JsonView } from 'react-json-view-lite'

import { getParseSpendBundle } from '~/api/api'
import AssetIcon from '~/components/AssetIcon'
import MemoDisplay from '~/components/Transaction/MemoDisplay'
import rootStore from '~/store'
import { ISpendBundleParse } from '~/types/api'
import { MethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'

import { IPopupPageProps } from '../types'
function spendBundleInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    const [parseBundle, setParseBundle] = useState<
        ISpendBundleParse | undefined
    >()

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

    const mojoToBalance = useCallback((amount, asset_id?) => {
        if (asset_id) {
            return mojoToCat(amount).toString()
        } else {
            return mojoToXch(amount).toString()
        }
    }, [])

    const onGetParseSpendBundle = async () => {
        try {
            const res = await getParseSpendBundle({
                data: {
                    spend_bundle: request?.data?.params?.spendBundle,
                },
            })
            setParseBundle(res?.data.data)
        } catch (error) {}
    }

    useLayoutEffect(() => {
        onGetParseSpendBundle()
    }, [request?.data?.params?.spendBundle])

    return (
        <div>
            {parseBundle ? (
                <>
                    <div>
                        <div className="mb-3 text-left text-caption text-primary-100">
                            Address
                        </div>
                        <div className="bg-box flex flex-col gap-1 px-2 py-2 shrink cursor-pointer rounded-sm ">
                            {shortenHash(metadata?.to_puzzle_hashes?.[0])}
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 mt-2 text-left text-caption text-primary-100">
                            Transaction
                        </div>
                        <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink  rounded-sm ">
                            <div className="text-left text-caption text-primary-100">
                                Send
                            </div>
                            <div className="flex mb-1 flex-row justify-between">
                                <div className="flex">
                                    <AssetIcon
                                        src={finsAsset?.icon_url}
                                        assetId={metadata?.asset_id || 'XCH'}
                                        className="mr-1 w-6 h-6"
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
                                <div className="mb-1 mt-2 text-left text-caption text-primary-100">
                                    Memo
                                </div>
                                <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink rounded-sm">
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
                        <div className="mb-1 mt-2 text-left text-caption text-primary-100">
                            Fee
                        </div>
                        <div className="bg-box flex flex-col gap-1 px-2 py-2 shrink  rounded-sm">
                            <div className="flex flex-row justify-between">
                                <div className="flex">
                                    <AssetIcon
                                        assetId={'XCH'}
                                        className="mr-1 w-6 h-6"
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
                        Send Transaction spendBundle:
                    </div>
                    <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink cursor-pointer rounded-sm ">
                        <div className="text-caption text-primary-100 h-[180px] overflow-y-auto">
                            <JsonView
                                data={request?.data?.params?.spendBundle}
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
