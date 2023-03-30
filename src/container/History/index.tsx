import { formatDistanceToNowStrict, Locale } from 'date-fns'
import { enUS, zhCN, zhTW } from 'date-fns/locale'
import { groupBy } from 'lodash-es'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendMeasurement } from '~/api/ga'
import Ably from '~/components/Ably'
import Transaction from '~/components/Transaction/Transaction'
import TransactionLoading from '~/components/Transaction/TransactionLoading'
import rootStore from '~/store'
import { LocaleEnum } from '~/types/i18n'
import ProcessingIcon from '~icons/hoogii/processing.jsx'

interface ILangItem {
    locale: keyof typeof LocaleEnum
    file: Locale
}

const langItems: ILangItem[] = [
    {
        locale: 'en',
        file: enUS,
    },
    {
        locale: 'zh-tw',
        file: zhTW,
    },
    {
        locale: 'zh-ch',
        file: zhCN,
    },
]

interface IOptions {
    addSuffix: boolean
    locale?: Locale
}

const History = () => {
    const { t, i18n } = useTranslation()
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
        assetsStore: { availableAssets },
        walletStore: { puzzleHash, isAblyConnected },
    } = rootStore

    const groupedHistory = useMemo(() => {
        const option: IOptions = {
            addSuffix: true,
            locale: langItems.filter(
                (item) => item.locale === i18n.language
            )?.[0]?.file,
        }

        return groupBy(history, (item) =>
            formatDistanceToNowStrict(item.updatedAt, option)
        )
    }, [history])

    const isFetching = fetching || availableAssets.isFetching

    const handleLoadMore = () => {
        loadMore()
        sendMeasurement({
            events: [
                {
                    name: 'activity_more',
                    params: {
                        category: 'activity',
                        action: 'click',
                    },
                },
            ],
        })
    }

    return (
        <div className="pb-5">
            {isFetching && <TransactionLoading />}
            {isAblyConnected && puzzleHash && (
                <Ably
                    channelName={'0x' + puzzleHash}
                    callback={(message) => {
                        completeHistory(message.data.data)
                    }}
                />
            )}
            {!(pendingHistory?.length || history?.length) && !isFetching ? (
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
                            {items.map((detail, index) => (
                                <Transaction
                                    key={`${detail.txId}_${index}`}
                                    {...detail}
                                />
                            ))}
                        </div>
                    ))}
                    <div className="flex-center">
                        {hasMore && !loading && (
                            <button
                                className="btn btn-primary btn-outline w-fit"
                                onClick={() => handleLoadMore()}
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
