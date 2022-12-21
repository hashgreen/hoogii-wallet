import { ChainEnum, IChain } from '~/types/chia'

import { cloneDatabase } from './utils'

export const walletTo0x02 = async (chain: IChain) => {
    if (chain.id === ChainEnum.Testnet) {
        try {
            await cloneDatabase('wallet', chain.id)
        } catch (error) {}
    }
}
