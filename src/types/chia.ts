export enum ChainEnum {
    Mainnet = '0x01',
    Testnet = '0x02',
}

export interface IChain {
    name: keyof typeof ChainEnum
    id: ChainEnum
    prefix: string
}
export interface IApiEndpointSet {
    jarvan: string
    zed: string
}
