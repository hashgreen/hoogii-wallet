import { Program } from '@rigidity/clvm'
export interface Coin {
    parent_coin_info: string
    puzzle_hash: string
    amount: bigint
}
export interface XCHPayload {
    puzzle: Program
    amount: bigint
    memo?: string
    fee?: bigint
    targetAddress: string
    spendableCoinList: Coin[]
    additionalConditions?: Program[]
}
