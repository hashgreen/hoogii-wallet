import { IAsset } from './api'

export class Asset {
    code: string
    name: string
    icon: string
    assetId: string

    constructor(asset: IAsset) {
        this.code = asset.code
        this.name = asset.name
        this.icon = asset.icon
        this.assetId = asset.asset_id
    }
}
