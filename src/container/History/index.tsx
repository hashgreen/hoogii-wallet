import { formatDistanceToNowStrict } from 'date-fns'
import { groupBy, orderBy } from 'lodash-es'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Ably from '~/components/Ably'
import Transaction from '~/components/Transaction/Transaction'
import TransactionLoading from '~/components/Transaction/TransactionLoading'
import rootStore from '~/store'
import ProcessingIcon from '~icons/hoogii/processing.jsx'
const History = () => {
    const { t } = useTranslation()
    const {
        historyStore: {
            loading,
            fetching,
            history,
            pendingHistory,
            hasMore,
            loadMore,
            completeHistory,
        },
        walletStore: { puzzleHash, isAblyConnected },
    } = rootStore

    const groupedHistory = useMemo(
        () =>
            groupBy(
                orderBy(history, (item) => item.createdAt, 'desc'),
                (item) =>
                    formatDistanceToNowStrict(item.createdAt, {
                        addSuffix: true,
                    })
            ),
        [history]
    )

    return (
        <div className="pb-5">
            {fetching && <TransactionLoading />}
            {isAblyConnected && (
                <Ably
                    channelName={'0x' + puzzleHash}
                    callback={(message) => {
                        completeHistory(message.data.data)
                    }}
                />
            )}
            {!(pendingHistory?.length || history?.length) && !fetching ? (
                <div className="mb-2 ml-3 text-body3 text-primary-100">
                    {t('no_result-activities')}
                </div>
            ) : (
                <div className="gap-5 flex-col-center child:w-full">
                    {!!pendingHistory?.length && (
                        <>
                            <div className="flex flex-col gap-2">
                                <div className="ml-3 capitalize text-body3 text-primary-100">
                                    {t('count-pending_history', {
                                        count: pendingHistory?.length ?? 0,
                                    })}
                                </div>
                                {pendingHistory.map((detail) => (
                                    <Transaction
                                        key={detail.txId}
                                        {...detail}
                                    />
                                ))}
                            </div>
                            <hr className="border-primary/30" />
                        </>
                    )}

                    {Object.entries(groupedHistory).map(([title, items]) => (
                        <div key={title} className="flex flex-col gap-2">
                            <div className="ml-3 capitalize text-body3 text-primary-100">
                                {title}
                            </div>
                            {items.map((detail) => (
                                <Transaction key={detail.txId} {...detail} />
                            ))}
                        </div>
                    ))}
                    <div className="flex-center">
                        {hasMore && !loading && (
                            <button
                                className="btn btn-primary btn-outline w-fit"
                                onClick={loadMore}
                            >
                                {t('btn-more')}
                            </button>
                        )}
                        {loading && (
                            <ProcessingIcon className="w-4 h-4 animate-spin my-2.5" />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default observer(History)
