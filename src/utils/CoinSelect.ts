import accumulative from './CoinSelect/accumulative'
import blackjack from './CoinSelect/blackjack'
import { Coin, CoinReturn, FeeRate } from './CoinSelect/types'

export function coinScore<T extends Coin>(x: T) {
    return x.amount
}

export default function coinSelect<T extends Coin, O extends Coin>(
    coins: T[],
    outputs: O[],
    feeRate: FeeRate = 0
): CoinReturn<T, O> {
    coins = coins.sort(function (a, b) {
        return Number(coinScore<T>(b)) - Number(coinScore<T>(a))
    })

    const base = blackjack(coins, outputs, feeRate)
    if (base?.coins) return base

    return accumulative(coins, outputs, feeRate)
}
