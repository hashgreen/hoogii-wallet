import { CoinRecord } from '@rigidity/chia'

import { Coin } from '~/utils/Wallet/types'

export type { Coin, CoinRecord }

export interface CoinTarget {
    coin?: Coin
}

export type FeeRate = bigint

export interface CoinReturn<T extends Coin, O extends Coin> {
    coins?: T[]
    outputs?: O[]
    fee?: bigint
}

export type CoinSelctFun<T extends Coin, O extends Coin> = (
    coins: T[],
    output: O[],
    feeRate: bigint
) => { coins?: T[]; output?: O[]; feeRate?: bigint }
