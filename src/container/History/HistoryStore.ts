import { makeAutoObservable, onBecomeObserved, runInAction } from 'mobx'

import { callGetTxByPuzzleHash } from '~/api/api'
import {
    ITransaction,
    ITransactionPrase,
    ITxStatus,
    IType,
} from '~/components/Transaction/type'
import WalletStore from '~/store/WalletStore'
import { add0x } from '~/utils/encryption'
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
        const {
            data: {
                data: { list: pendingTxHistory, total },
            },
        } = await callGetTxByPuzzleHash({
            puzzle_hash: '0x' + this.walletStore.puzzleHash,
            page: 1,
            status: ITxStatus.TX_STATUS_IN_MEMPOOL,
        })
        runInAction(() => {
            this.pendingHistory = this.formatHistory(pendingTxHistory)
        })
        if (this.pendingHistory.length < total) {
            const {
                data: {
                    data: { list },
                },
            } = await callGetTxByPuzzleHash({
                puzzle_hash: '0x' + this.walletStore.puzzleHash,
                page: 1,
                status: ITxStatus.TX_STATUS_IN_MEMPOOL,
                size: total,
            })
            runInAction(() => {
                this.pendingHistory = this.formatHistory(list)
            })
        }
    }

    checkHistory = async () => {
        runInAction(() => {
            if (this.page === 1) {
                this.fetching = true
            } else {
                this.loading = true
            }
        })
        const typeList = [1, 2, 4]
        const {
            data: {
                data: { list: txHistory, total },
            },
        } = await callGetTxByPuzzleHash({
            type: typeList.join(','),
            puzzle_hash: '0x' + this.walletStore.puzzleHash,
            page: this.page,
            status: ITxStatus.TX_STATUS_ON_CHAIN,
        })
        runInAction(() => {
            this.total = total
            this.history = [...this.history, ...this.formatHistory(txHistory)]
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

    formatHistoryNew = (history: ITransactionPrase[]) => {
        return history?.map(
            ({
                fee,
                created_at,
                status,
                type,
                name,
                balance_changes,
                updated_at,
                memos,
            }): ITransaction => {
                const myBalanceChanges =
                    balance_changes[
                        '0x0d016fe60d9f78429aaa10b271000c08ecfb7c2bc11b8aa20c7c70d95e32eccd' ||
                            add0x(this.walletStore.puzzleHash)
                    ]?.asset_balance_change

                const myAssetBalanceChangeArray = Object.keys(myBalanceChanges)
                    .map((key) => ({ assetId: key, ...myBalanceChanges[key] }))
                    .sort((a, b) => {
                        const aAmount = a?.amount || 0
                        const bAmount = b?.amount || 0
                        return aAmount - bAmount
                    })
                const myAssetBalanceChange = myAssetBalanceChangeArray?.[0]

                return {
                    assetId: myAssetBalanceChange.assetId,
                    cname: '',
                    txType: type,
                    fee,
                    receiver: '',
                    sender: '',
                    createdAt: new Date(created_at),
                    updatedAt: new Date(updated_at),
                    txId: name,
                    amount: myAssetBalanceChange.amount || 0,
                    memos,
                    action: 'send',
                    status,
                }
            }
        )
    }

    formatHistory = (history) =>
        history?.map(
            ({
                cname,
                fee,
                created_at,
                status,
                type,
                name,
                metadata: {
                    amount,
                    asset_id,
                    to_puzzle_hashes,
                    from_puzzle_hash,
                    memos,
                },
                updated_at,
            }): ITransaction => {
                return {
                    assetId: asset_id,
                    status,
                    cname,
                    txType: type,
                    fee,
                    receiver: to_puzzle_hashes?.[0] ?? '',
                    sender: from_puzzle_hash,
                    createdAt: new Date(created_at),
                    updatedAt: new Date(updated_at),
                    txId: name,
                    amount,
                    memos,
                    action:
                        ('0x' + this.walletStore.puzzleHash === from_puzzle_hash
                            ? 'send'
                            : 'receive') || '',
                }
            }
        )

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
