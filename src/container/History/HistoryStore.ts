import { makeAutoObservable, onBecomeObserved, runInAction } from 'mobx'

import { callGetTxByPuzzleHash } from '~/api/api'
import {
    IBalanceChanges,
    ITransaction,
    ITransactionPrase,
    ITxStatus,
    IType,
} from '~/components/Transaction/type'
import WalletStore from '~/store/WalletStore'
import { add0x } from '~/utils/encryption'
import { puzzleHashToAddress } from '~/utils/signature'

const test: IBalanceChanges = {
    '': {
        asset_balance_change: {
            '': {
                amount: 185520,
            },
            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                {
                    amount: -185520,
                },
        },
    },
    '0x0d016fe60d9f78429aaa10b271000c08ecfb7c2bc11b8aa20c7c70d95e32eccd': {
        asset_balance_change: {
            '': {
                amount: -1000000000000,
            },
            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                {
                    amount: -38771,
                },
            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                {
                    amount: 185520,
                },
        },
    },
    '0x3b82adf1903425c733223cf0c697399fce63e8b07d29cffdd3cf3fc36dfffe00': {
        asset_balance_change: {
            '': {
                amount: 999999814480,
            },
            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                {
                    amount: 38771,
                },
        },
    },
    '0x899eb615ab3e6971119e5c666980803efdd9bc6f9b1c4b045a3e404a0c0aa784': {
        asset_balance_change: {
            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                {},
        },
    },
    '0xcfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7': {
        asset_balance_change: {
            '': {},
            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                {},
            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                {},
        },
    },
    '0xf625da338fd204f85947f1f8f1be51c2a72ca335739148d9fde0d80c474baf17': {
        asset_balance_change: {
            '': {},
        },
    },
}
console.log('test', test)

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
