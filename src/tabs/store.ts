import { makeObservable, observable } from 'mobx'

import {
    CreateMnemonicStore,
    ImportMnemonicStore,
    ResetMnemonicStore,
} from '~/store/MnemonicStore'
import WalletStore from '~/store/WalletStore'
import { InternalStore } from '~/utils/extension'

export class TabsStore extends InternalStore {
    walletStore: WalletStore
    createMnemonicStore: CreateMnemonicStore
    importMnemonicStore: ImportMnemonicStore
    resetMnemonicStore: ResetMnemonicStore

    constructor() {
        super('')
        makeObservable(this, {
            walletStore: observable,
            createMnemonicStore: observable,
            importMnemonicStore: observable,
            resetMnemonicStore: observable,
        })
        this.walletStore = new WalletStore()
        this.createMnemonicStore = new CreateMnemonicStore(this.walletStore)
        this.importMnemonicStore = new ImportMnemonicStore(this.walletStore)
        this.resetMnemonicStore = new ResetMnemonicStore(this.walletStore)
    }

    getMnemonicStore = (type: 'create' | 'import' | 'reset') => {
        switch (type) {
            case 'create':
                return this.createMnemonicStore
            case 'import':
                return this.importMnemonicStore
            case 'reset':
                return this.resetMnemonicStore
        }
    }
}

export default new TabsStore()
