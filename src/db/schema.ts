export interface IAsset {
    assetId: string
    code: string
    iconUrl?: string
}

export interface IAddress {
    id?: number
    name: string
    address: string
}

export interface IConnectedSite {
    id?: number
    name: string
    url?: string
    iconUrl?: string
}
