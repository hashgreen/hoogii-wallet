import { Program } from '@rigidity/clvm'

import { Coin } from './Wallet/types'
import { Wallet } from './Wallet/Wallet'

class _CoinSpend {
    coin: Coin
    puzzle_reveal: string
    solution: string
    constructor(coin, puzzle_reveal, solution) {
        this.coin = coin
        this.puzzle_reveal = puzzle_reveal
        this.solution = solution
    }

    public additions() {
        const conditions = Program.deserializeHex(this.puzzle_reveal)
            .run(Program.deserializeHex(this.solution))
            .value.toList()
        const additionList: Coin[] = []
        conditions.forEach((condition) => {
            if (condition.first.toInt() === 51) {
                additionList.push({
                    parent_coin_info: Program.fromBytes(
                        Wallet.coinName(this.coin)
                    ).toHex(),
                    puzzle_hash: Program.fromBytes(
                        condition.rest.first.atom
                    ).toHex(),
                    amount: condition.rest.rest.first.toBigInt(),
                })
            }
        })
        return additionList
    }

    toJSON() {
        return {
            ...this,
            coin: {
                ...this.coin,
                amount: Number(this.coin.amount.toString()),
            },
        }
    }
}
export default _CoinSpend
