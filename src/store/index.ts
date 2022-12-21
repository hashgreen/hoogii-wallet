import { makeAutoObservable } from 'mobx'

import HistoryStore from '~/container/History/HistoryStore'

import AssetsStore from './AssetsStore'
import TransactionStore from './TransactionStore'
import WalletStore from './WalletStore'
export class RootStore {
    walletStore: WalletStore
    assetsStore: AssetsStore
    historyStore: HistoryStore
    transactionStore: TransactionStore

    constructor() {
        makeAutoObservable(this)

        this.walletStore = new WalletStore()
        this.transactionStore = new TransactionStore(this.walletStore)
        this.assetsStore = new AssetsStore(this.walletStore)
        this.historyStore = new HistoryStore(this.walletStore)
    }

   
}

const rootStore = new RootStore()

export default rootStore
