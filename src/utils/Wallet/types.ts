import { Program } from '@rigidity/clvm'
export interface Coin {
    parent_coin_info: string
    puzzle_hash: string
    amount: bigint
}
export interface XCHPayload {
    puzzleReveal: Program
    amount: string
    memo?: string
    fee?: string
    targetAddress: string
    spendableCoinList: Coin[]
    additionalConditions?: Program[]
}
