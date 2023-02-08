import { ChainEnum, IApiEndpointSet, IChain } from '~/types/chia'
export const standardMnemonicLength = 24
export const chains: readonly IChain[] = [
    {
        name: 'Mainnet',
        id: ChainEnum.Mainnet,
        prefix: 'xch',
        agg_sig_me_additional_data:
            'ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb',
    },
    {
        name: 'Testnet',
        id: ChainEnum.Testnet,
        prefix: 'txch',
        agg_sig_me_additional_data:
            'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2',
    },
] as const
export const apiEndpointSets: {
    [key in ChainEnum]: IApiEndpointSet
} = {
    [ChainEnum.Mainnet]: {
        jarvan: 'https://prod-jarvan.hash.green/api/v1',
        zed: 'https://hash.green/api/v1',
    },
    [ChainEnum.Testnet]: {
        jarvan: 'https://stg-jarvan.hash.green/api/v1',
        zed: 'https://testnet10.hash.green/api/v1',
    },
} as const
