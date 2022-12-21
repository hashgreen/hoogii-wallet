import { ChainEnum, IApiEndpointSet, IChain } from '~/types/chia'

export const chains: readonly IChain[] = [
    {
        name: 'Mainnet',
        id: ChainEnum.Mainnet,
        prefix: 'xch',
    },
    {
        name: 'Testnet',
        id: ChainEnum.Testnet,
        prefix: 'txch',
    },
] as const
export const apiEndpointSets: {
    [key in ChainEnum]: IApiEndpointSet
} = {
    '0x01': {
        jarvan: 'https://stg-jarvan.hash.green/api/v1',
        zed: 'https://testnet10.hash.green/api/v1',
    },
    '0x02': {
        jarvan: 'https://uat-jarvan.hash.green/api/v1',
        zed: 'https://testnet10.hash.green/api/v1',
    },
} as const
