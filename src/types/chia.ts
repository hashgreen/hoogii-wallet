export enum ChainEnum {
    Mainnet = '0x01',
    Testnet = '0x02',
    Develop = '0x99',
}

export interface IChain {
    name: keyof typeof ChainEnum
    id: ChainEnum
    prefix: string
    agg_sig_me_additional_data: string
}
export interface IChainSet {
    [key: string]: IChain
}

export interface IApiEndpointSet {
    newJarvan: string
    jarvan: string
    zed: string
}
