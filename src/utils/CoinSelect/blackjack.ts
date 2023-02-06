import { Coin, CoinReturn, FeeRate } from './types'
import utils from './utils'

export default function blackjack<T extends Coin, O extends Coin>(
    coins: T[],
    outputs: O[],
    feeRate: FeeRate = 0n
): CoinReturn<T, O> {
    if (utils.uintOrNaN(feeRate)) return {}

    let bytesAccum = 0n // Calculate summary of byte
    const outAccum = utils.sumOrNaN(outputs) // summary of output
    const threshold = 0n // utils.dustThreshold({}, feeRate)
    let inAccum = 0n // input summary
    const inputs: T[] = [] // input coin
    for (let i = 0; i < coins.length; ++i) {
        const input: T = coins[i]
        const inputBytes = utils.inputBytes(input)
        const fee = feeRate * (bytesAccum + inputBytes)
        const inputValue = utils.uintOrNaN(input.amount)

        // would it waste value? Skip when input is greater than output
        if (inAccum + inputValue > outAccum + fee + threshold) continue

        bytesAccum += inputBytes
        inAccum += inputValue
        inputs.push(input)

        // When the sum is still less than the target, skip
        if (inAccum < outAccum + fee) continue

        // When the summary is a greater target value than the return finalize function
        return utils.finalize<T, O>(inputs, outputs, feeRate)
    }

    return {}
}
