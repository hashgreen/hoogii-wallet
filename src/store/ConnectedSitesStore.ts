import { liveQuery } from 'dexie'
import { makeAutoObservable, onBecomeUnobserved } from 'mobx'

import { IConnectedSite, WalletDexie } from '~/db'
import { ChainEnum } from '~/types/chia'
import { StorageEnum } from '~/types/storage'
import { getStorage } from '~/utils/storage'
class ConnectedSitesStore {
    connectedSites: IConnectedSite[] = []

    unsubscribeConnectedSites = () => {}
    subscribeConnectedSites = () => {
        const observable = liveQuery(async () => {
            const chainId = await getStorage<string>(StorageEnum.chainId)
            const db = new WalletDexie(chainId ?? ChainEnum.Mainnet)
            return db.connectedSites.toArray()
        })
        const subscription = observable.subscribe({
            next: (result) => (this.connectedSites = result),
        })
        this.unsubscribeConnectedSites = () => subscription.unsubscribe()
    }

    constructor() {
        makeAutoObservable(this)
        this.subscribeConnectedSites()
        onBecomeUnobserved(
            this,
            'connectedSites',
            this.unsubscribeConnectedSites
        )
    }

    isConnectedSite = async (origin) => {
        const chainId = await getStorage<string>(StorageEnum.chainId)
        console.log('chainId', chainId)
        // const db = new WalletDexie(chainId ?? ChainEnum.Mainnet)
        // const connectedSites = db.connectedSites as IConnectedSite[]
        return this.connectedSites.some((site) => site.url === origin)
    }
}

const store = new ConnectedSitesStore()

export default store
