import { ChainEnum, IChain } from '~/types/chia'

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
