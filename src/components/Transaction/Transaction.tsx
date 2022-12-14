import { sanitizeHex } from '@rigidity/chia'
import classNames from 'classnames'
import { format } from 'date-fns'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CopyTooltip from '~/components/CopyTooltip'
import rootStore from '~/store'
import { shortenHash } from '~/utils'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'
import { puzzleHashToAddress } from '~/utils/signature'
import ActivityCoinbase from '~icons/hoogii/activity-coinbase.jsx'
import ActivityOffer from '~icons/hoogii/activity-offer.jsx'
import ActivityReceive from '~icons/hoogii/activity-receive.jsx'
import ActivitySend from '~icons/hoogii/activity-send.jsx'
import BottomIcon from '~icons/hoogii/bottom.jsx'
import CopyIcon from '~icons/hoogii/copy.jsx'
import ProcessingIcon from '~icons/hoogii/processing.jsx'

import { Collapse } from './Transaction.style'
import { ITransaction, ITxStatus, ITxType, IType } from './type'

const bgColorMap = {
    [IType.Send]: 'bg-status-send',
    [IType.Receive]: 'bg-status-receive',
    [IType.Offer]: 'bg-status-offer',
}
const statusText = {
    [ITxType.TX_TYPE_COINBASE]: 'reward',
}

const Transaction = ({
    amount,
    memos,
    assetId,
    receiver,
    sender,
    fee,
    createdAt,
    txType,
    action,
    txId,
    status,
}: ITransaction) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const {
        walletStore: { chain },
        assetsStore: { assets, XCH },
    } = rootStore

    const asset = useMemo(
        () => assets.find((asset) => '0x' + asset.assetId === assetId),
        [assetId, assets]
    )
    const isTransfer =
        txType === ITxType.TX_TYPE_CAT_TRANSFER ||
        txType === ITxType.TX_TYPE_STANDARD_TRANSFER

    // NOTE : if the tx is cat transfer, then the first memo is puzzlehash, so do not show it
    const filteredMemo =
        memos && txType === ITxType.TX_TYPE_CAT_TRANSFER
            ? memos.slice(1)
            : memos

    return (
        <Collapse
            className={classNames(
                'cursor-pointer px-4 py-3 border rounded-lg box-border bg-white/5 border-primary/30 hover:border-primary w-full'
            )}
        >
            <div
                onClick={() => {
                    setOpen(!open)
                }}
                className="justify-between w-full mb-1 flex-row-center"
            >
                <div className="flex-row-center">
                    <div
                        className={`w-[44px] flex-center flex-col rounded-lg py-2 px-1  ${classNames(
                            status === ITxStatus.TX_STATUS_IN_MEMPOOL
                                ? 'bg-disable'
                                : bgColorMap[action]
                        )} ${classNames({
                            'bg-status-coinbase':
                                txType === ITxType.TX_TYPE_COINBASE,
                        })}`}
                    >
                        {status === ITxStatus.TX_STATUS_IN_MEMPOOL ? (
                            <ProcessingIcon className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                {txType === ITxType.TX_TYPE_COINBASE && (
                                    <ActivityCoinbase width={16} height={16} />
                                )}
                                {txType === ITxType.TX_TYPE_OFFER1_SWAP && (
                                    <ActivityOffer width={16} height={16} />
                                )}
                                {isTransfer && action === IType.Send && (
                                    <ActivitySend width={16} height={16} />
                                )}

                                {isTransfer && action === IType.Receive && (
                                    <ActivityReceive width={16} height={16} />
                                )}
                            </>
                        )}
                        <span className="text-body3">
                            {isTransfer ? action : statusText[txType]}
                        </span>
                    </div>
                    <div className="flex-col ml-4">
                        <div
                            className={`${classNames({
                                'text-status-receive':
                                    action === IType.Receive ||
                                    txType === ITxType.TX_TYPE_COINBASE,
                                'text-status-send': action === IType.Send,
                                'text-status-offer':
                                    txType === ITxType.TX_TYPE_OFFER1_SWAP,
                            })} text-body2`}
                        >
                            {action === IType.Receive ||
                            txType === ITxType.TX_TYPE_COINBASE
                                ? '+'
                                : '-'}
                            <span>
                                {txType < 3
                                    ? mojoToXch(
                                          amount?.toString() ?? '0'
                                      ).toFixed()
                                    : mojoToCat(
                                          amount?.toString() ?? '0'
                                      ).toFixed()}
                            </span>{' '}
                            {asset?.code ?? XCH.code}
                        </div>
                        {action === IType.Send && (
                            <div className="mt-1 text-body3 text-primary-100">
                                {t('transaction-fee', {
                                    fee: mojoToXch(
                                        fee?.toString() ?? '0'
                                    ).toFixed(),
                                    code: XCH.code,
                                })}
                            </div>
                        )}
                        {txType === ITxType.TX_TYPE_COINBASE && (
                            <span className="capitalize text-primary-100">
                                {t('transaction-farming-rewards')}
                            </span>
                        )}
                    </div>
                </div>

                <BottomIcon
                    className={`w-5 h-5 text-active ${classNames({
                        open,
                    })}`}
                />
            </div>
            <div
                className={`collapse-content text-body3 text-primary-100 ${classNames(
                    {
                        open,
                    }
                )}`}
            >
                <div className="flex justify-between pt-3 text-caption select-none">
                    <span className="capitalize">
                        {action === IType.Send && t('transaction-to')}
                        {action === IType.Receive && t('transaction-from')}
                        {txType === ITxType.TX_TYPE_COINBASE &&
                            t('transaction-detail')}
                    </span>
                    <div>
                        <span>
                            {format(
                                new Date(createdAt || 1661250234321),
                                'yyyy-MM-dd HH:mm:ss'
                            )}
                        </span>
                    </div>
                </div>
                {txType !== ITxType.TX_TYPE_COINBASE && (
                    <>
                        {chain && (
                            <CopyTooltip
                                dataTip={t('tooltip-copy_address')}
                                copiedDataTip={t('tooltip-copied')}
                                value={puzzleHashToAddress(
                                    action === IType.Send ? receiver : sender,
                                    chain?.prefix
                                )}
                                className="gap-1 mt-1 text-dark-scale-100 w-min flex-row-center after:whitespace-nowrap select-none"
                            >
                                {shortenHash(
                                    puzzleHashToAddress(
                                        action === IType.Send
                                            ? receiver
                                            : sender,
                                        chain?.prefix
                                    )
                                )}
                                <CopyIcon className="w-3 h-3" />
                            </CopyTooltip>
                        )}
                        <div className="mt-4 text-caption capitalize">
                            <span>{t('transaction-detail')}</span>
                        </div>
                    </>
                )}

                <div className="mt-1 text-tertiary" title={txId}>
                    {shortenHash(txId)}
                </div>
                <div className="pt-3 text-caption">
                    <span className="capitalize">{t('transaction-memo')}</span>
                    <div className="mt-1 text-tertiary">
                        {filteredMemo?.map((memo, index) => (
                            <span
                                className="break-words"
                                key={`${index}-${memo}`}
                            >
                                {`${memo} `}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Collapse>
    )
}

export default observer(Transaction)
