import { makeAutoObservable } from 'mobx'

import { WalletDexie } from '~/db'
import { ChainEnum } from '~/types/chia'
import { StorageEnum } from '~/types/storage'
import { getStorage } from '~/utils/extension/storage'
class ConnectedSitesStore {
    constructor() {
        makeAutoObservable(this)
    }

    getConnectedSite = async () => {
        const chainId = await getStorage<string>(StorageEnum.chainId)
        const db = new WalletDexie(chainId ?? ChainEnum.Mainnet)
        return await db.connectedSites.toArray()
    }

    isConnectedSite = async (url: string) => {
        const connectedSites = await this.getConnectedSite()
        return connectedSites.some((site) => site.url === url)
    }
}

const store = new ConnectedSitesStore()

export default store
