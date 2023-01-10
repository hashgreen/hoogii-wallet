import { makeAutoObservable } from 'mobx'

import { WalletDexie } from '~/db'
import { ChainEnum } from '~/types/chia'
import { StorageEnum } from '~/types/storage'
import { getStorage } from '~/utils/extension/storage'
class ConnectedSitesStore {
    constructor() {
        makeAutoObservable(this)
    }

    isConnectedSite = async (origin) => {
        const chainId = await getStorage<string>(StorageEnum.chainId)
        const db = new WalletDexie(chainId ?? ChainEnum.Mainnet)
        const connectedSites = await db.connectedSites.toArray()
        return connectedSites.some((site) => site.url === origin)
    }
}

const store = new ConnectedSitesStore()

export default store
