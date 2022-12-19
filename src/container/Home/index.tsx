import Decimal from 'decimal.js-light'
import { observer } from 'mobx-react-lite'
import { lazy, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import Ably from '~/components/Ably'
import SearchBar from '~/components/SearchBar'
import Tabs from '~/components/Tabs'
import Header from '~/layouts/Header'
import rootStore from '~/store'
import { ChainEnum } from '~/types/chia'
import { enumArray } from '~/utils'
import { mojoToXch } from '~/utils/CoinConverter'
import SendIcon from '~icons/hoogii/activity-send.jsx'

import Info from './Info'

const History = lazy(() => import('~/container/History'))

enum TabEnum {
    Asset,
    Activity,
}

interface IProps {
    initialTab?: number
}

const Home = ({ initialTab = 0 }: IProps) => {
    const { t } = useTranslation()
    const [tab, setTab] = useState(initialTab)
    const [query, setQuery] = useState('')

    const {
        walletStore: { puzzleHash, isAblyConnected, chain },
        assetsStore: {
            XCH,
            balancesData,
            getBalanceByPuzzleHash,
            exchangeRateData,
            updateBalance,
            getExchangeRate,
        },
    } = rootStore

    const xchBalance = mojoToXch(getBalanceByPuzzleHash('0x' + puzzleHash))

    const xch2usds =
        chain?.id === ChainEnum.Testnet // if the chain is testnet, the it always get 0
            ? '0'
            : exchangeRateData?.data?.price_xch
            ? (1 / Number(exchangeRateData.data.price_xch))
                  .toFixed(2)
                  .toString()
            : ''

    useEffect(() => {
        getExchangeRate()
    }, [])

    return (
        <div className="relative flex flex-col h-full bg-main">
            <Header className="sticky left-0 right-0" />
            {isAblyConnected && (
                <Ably
                    channelName={'0x' + puzzleHash}
                    callback={(message) => {
                        updateBalance(message.data.data)
                    }}
                />
            )}
            <div className="flex flex-col overflow-hidden grow">
                <div className="overflow-auto container">
                    <div className="justify-between mt-3 mb-6 flex-row-center">
                        <div className="flex flex-col gap-0.5">
                            {balancesData.isFetching ? (
                                <div className="skeleton skeleton-text w-[180px]"></div>
                            ) : (
                                <div
                                    className="font-bold text-headline1"
                                    title={xchBalance.toFixed()}
                                >
                                    {xchBalance.decimalPlaces() > 6
                                        ? `${xchBalance.toFixed(
                                              6,
                                              Decimal.ROUND_DOWN
                                          )}...`
                                        : xchBalance.toFixed()}
                                    <span className="text-headline3">
                                        {' '}
                                        {XCH.code}
                                    </span>
                                </div>
                            )}
                            <span className="font-medium text-body2 text-primary-100">
                                {exchangeRateData.isFetching
                                    ? '---'
                                    : `${xch2usds} USD`}
                            </span>
                        </div>
                        <Link to="/transfer" className="btn btn-CTA_main">
                            {t('btn-send')} <SendIcon className="w-3 h-3" />
                        </Link>
                    </div>
                    <Tabs
                        tabs={enumArray(TabEnum).map((e) =>
                            t(TabEnum[e].toLowerCase())
                        )}
                        defaultIndex={tab}
                        onChange={setTab}
                        navChildren={
                            tab === TabEnum.Asset && (
                                <SearchBar
                                    value={query}
                                    onChange={(e) =>
                                        setQuery(e.currentTarget.value)
                                    }
                                    collapsible
                                    className="!absolute right-0"
                                    placeholder={t('search-assets-placeholder')}
                                    onClose={(isCollapsed) =>
                                        isCollapsed && setQuery('')
                                    }
                                />
                            )
                        }
                    >
                        {(tab, index) => (
                            <>
                                {index === TabEnum.Asset && (
                                    <Info query={query} />
                                )}
                                {index === TabEnum.Activity && <History />}
                            </>
                        )}
                    </Tabs>
                </div>
            </div>
            {tab === 0 && (
                <div className="pb-8 flex-center pt-7">
                    <Link
                        to="/importCAT"
                        className="btn btn-primary btn-outline w-fit"
                    >
                        {t('btn-import_token')}
                    </Link>
                </div>
            )}
        </div>
    )
}

export default observer(Home)
