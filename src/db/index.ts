import Dexie, { Table } from 'dexie'

import { StorageEnum } from '~/types/extension'

import { IAddress, IAsset, IConnectedSite } from './schema'

export class WalletDexie extends Dexie {
    [StorageEnum.ASSETS]!: Table<IAsset>;
    [StorageEnum.ADDRESSES]!: Table<IAddress>;
    [StorageEnum.CONNECTED_SITES]!: Table<IConnectedSite>

    constructor() {
        super('wallet')
        this.version(3).stores({
            [StorageEnum.ASSETS]: 'assetId, code, iconUrl',
            [StorageEnum.ADDRESSES]: 'id++, name, address',
        })
        this.version(4).stores({
            [StorageEnum.ASSETS]: 'assetId, code, iconUrl',
            [StorageEnum.ADDRESSES]: 'id++, name, address',
            [StorageEnum.CONNECTED_SITES]: 'id++, name, url, iconUrl',
        })
    }
}

export const db = new WalletDexie()

export * from './schema'
