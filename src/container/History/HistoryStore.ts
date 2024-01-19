import { TxType } from '@hashgreen/hg-models/apis'
import { fetchTransactions } from '@hashgreen/hg-query/jarvan'
import { makeAutoObservable, onBecomeObserved, runInAction } from 'mobx'

import {
    getApiEndpoint,
    transformITxStatusToTxStatus,
    transformTransactionToITransactionPrase,
} from '~/api/utils'
import { ITransaction, ITxStatus, IType } from '~/components/Transaction/type'
import WalletStore from '~/store/WalletStore'
import { add0x } from '~/utils/encryption'
import praseHistory from '~/utils/praseHistory'
import { puzzleHashToAddress } from '~/utils/signature'

class HistoryStore {
    walletStore: WalletStore
    loading: boolean = false
    fetching: boolean = true
    history: ITransaction[] = []
    pendingHistory: ITransaction[] = []
    page: number = 1
    count: number = 10
    total: number = 0

    constructor(walletStore: WalletStore) {
        makeAutoObservable(this)
        this.walletStore = walletStore

        onBecomeObserved(this, 'history', () => {
            !this.history?.length && this.checkHistory()
        })
        onBecomeObserved(this, 'pendingHistory', () => {
            !this.pendingHistory?.length && this.checkPendingHistory()
        })
    }

    get hasMore() {
        return this.history.length < this.total
    }

    loadMore = async () => {
        this.page += 1
        await this.checkHistory()
    }

    get recentAddress() {
        const item = this.history[0]
        if (item) {
            return puzzleHashToAddress(
                item.action === IType.Send ? item.receiver : item.sender,
                this.walletStore.chain.prefix
            )
        }
        return undefined
    }

    checkPendingHistory = async () => {
        const baseUrl = await getApiEndpoint()
        const [pendingTxHistory, { total }] = await fetchTransactions({
            baseUrl,
        })({
            puzzleHash: add0x(this.walletStore.puzzleHash),
            page: 1,
            status: [ITxStatus.TX_STATUS_IN_MEMPOOL].map(
                transformITxStatusToTxStatus
            ),
        })
        runInAction(() => {
            this.pendingHistory = this.formatHistory(
                pendingTxHistory.map(transformTransactionToITransactionPrase)
            )
        })
        if (this.pendingHistory.length < total) {
            const [list] = await fetchTransactions({ baseUrl })({
                puzzleHash: add0x(this.walletStore.puzzleHash),
                page: 1,
                status: [ITxStatus.TX_STATUS_IN_MEMPOOL].map(
                    transformITxStatusToTxStatus
                ),
                size: total,
            })
            runInAction(() => {
                this.pendingHistory = this.formatHistory(
                    list.map(transformTransactionToITransactionPrase)
                )
            })
        }
    }

    checkHistory = async () => {
        const baseUrl = await getApiEndpoint()
        runInAction(() => {
            if (this.page === 1) {
                this.fetching = true
            } else {
                this.loading = true
            }
        })
        const types = [
            TxType.TX_TYPE_COINBASE,
            TxType.TX_TYPE_STANDARD_TRANSFER,
            TxType.TX_TYPE_CAT_TRANSFER,
            TxType.TX_TYPE_OFFER1_SWAP,
        ]
        const [txHistory, { total }] = await fetchTransactions({ baseUrl })({
            type: types,
            puzzleHash: add0x(this.walletStore.puzzleHash),
            page: this.page,
            status: [ITxStatus.TX_STATUS_ON_CHAIN].map(
                transformITxStatusToTxStatus
            ),
        })
        console.log([...txHistory])
        runInAction(() => {
            this.total = total
            this.history = [
                ...this.history,
                ...this.formatHistory(
                    txHistory.map(transformTransactionToITransactionPrase)
                ),
            ]
            this.loading = false
            this.fetching = false
        })
    }

    completeHistory = (data) => {
        const completedHistoryIndex = this.pendingHistory.findIndex(
            (history) => history.cname === data.cname
        )

        if (completedHistoryIndex >= 0) {
            const completedHistory = this.pendingHistory.splice(
                completedHistoryIndex,
                1
            )
            this.history.unshift(completedHistory[0])
        }
    }

    formatHistory = (history: Parameters<typeof praseHistory>[0][]) => {
        return (
            history?.map((ITransaction) =>
                praseHistory(ITransaction, add0x(this.walletStore.puzzleHash))
            ) || []
        )
    }

    reset = () => {
        this.history = []
        this.pendingHistory = []
        this.page = 1
        this.count = 10
        this.total = 0
    }

    updateData = (dataKey: string, value: any): void => {
        runInAction(() => {
            this[dataKey] = value
        })
    }
}

export default HistoryStore
