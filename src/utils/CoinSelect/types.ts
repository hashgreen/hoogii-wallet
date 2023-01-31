import { CoinRecord } from '@rigidity/chia'

import { Coin } from '~/utils/Wallet/types'

export type { Coin, CoinRecord }

export interface CoinTarget {
    coin?: Coin
}

export type FeeRate = number

export interface CoinReturn<T extends Coin, O extends Coin> {
    coins?: T[]
    outputs?: O[]
    fee?: number
}

export type CoinSelctFun<T extends Coin, O extends Coin> = (
    coins: T[],
    output: O[],
    feeRate: number
) => { coins?: T[]; output?: O[]; feeRate?: number }
