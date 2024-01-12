import { ChainEnum } from '@hashgreen/hg-models'
import {
    Coin as _Coin,
    SpendBundle as _SpendBundle,
} from '@hashgreen/hg-models/chia'

import { getStorage } from '~/utils/extension/storage'
import SpendBundle from '~/utils/SpendBundle'
import { Coin } from '~/utils/Wallet/types'

import { apiEndpointName, apiEndpointSets } from './constants'

export const getApiEndpointSet = (chain: ChainEnum) => {
    const apiEndpointSet = apiEndpointSets[chain]
    if (!apiEndpointSet) {
        throw new Error(`Chain ${chain} is not supported`)
    }
    return apiEndpointSet
}

export const getApiEndpoint = async (name: apiEndpointName = 'jarvan') => {
    const chainId = await getStorage<string>('chainId')
    const apiEndpointSet = getApiEndpointSet(
        (chainId as ChainEnum) || ChainEnum.Mainnet
    )
    return apiEndpointSet[name]
}

export const transformCoins = (coin: _Coin): Coin => ({
    parent_coin_info: coin.parentCoinInfo,
    puzzle_hash: coin.puzzleHash,
    amount: coin.amount,
})

export const transformSpendBundles = (spendBundle: SpendBundle) => {
    return _SpendBundle.fromJSON(spendBundle.getObj())
}
