import { ChainEnum, IApiEndpointSet, IChainSet } from '~/types/chia'
export const standardMnemonicLength = 24
export const chains: IChainSet = {
    [ChainEnum.Mainnet]: {
        name: 'Mainnet',
        prefix: 'xch',
        id: ChainEnum.Mainnet,
        agg_sig_me_additional_data:
            'ccd5bb71183532bff220ba46c268991a3ff07eb358e8255a65c30a2dce0e5fbb',
    },
    [ChainEnum.Testnet]: {
        name: 'Testnet',
        prefix: 'txch',
        id: ChainEnum.Testnet,
        agg_sig_me_additional_data:
            'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2',
    },
    [ChainEnum.Develop]: {
        name: 'Develop',
        prefix: 'txch',
        id: ChainEnum.Develop,
        agg_sig_me_additional_data:
            'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2',
    },
}
export const apiEndpointSets: {
    [key in ChainEnum]: IApiEndpointSet
} = {
    [ChainEnum.Mainnet]: {
        newJarvan: 'https://jarvan-api.hash.green/api/v1',
        jarvan: 'https://prod-jarvan.hash.green/api/v1',
        zed: 'https://hash.green/api/v1',
    },
    [ChainEnum.Testnet]: {
        newJarvan: 'https://uat-jarvan-api.hash.green/api/v1',
        jarvan: 'https://stg-jarvan.hash.green/api/v1',
        zed: 'https://testnet10.hash.green/api/v1',
    },
    [ChainEnum.Develop]: {
        newJarvan: 'https://uat-jarvan-api.hash.green/api/v1',
        jarvan: 'https://uat-jarvan.hash.green/api/v1',
        zed: 'https://testnet10.hash.green/api/v1',
    },
} as const
export const CAT_AMOUNT_REGEX = /^[0-9]+(.[0-9]{1,3})?$/
export const XCH_AMOUNT_REGEX = /^[0-9]+(.[0-9]{1,12})?$/
