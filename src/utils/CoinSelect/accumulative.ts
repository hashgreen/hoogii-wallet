import { Coin, CoinReturn, FeeRate } from './types'
import utils from './utils'

export default function accumulative<T extends Coin, O extends Coin>(
    coins: T[],
    outputs: O[],
    feeRate: FeeRate = 0n
): CoinReturn<T, O> {
    if (utils.uintOrNaN(feeRate)) return {}

    let bytesAccum = 0n // Calculate summary of byte
    let inAccum = 0n
    const inputs: T[] = []
    const outAccum = utils.sumOrNaN(outputs)
    for (let i = 0; i < coins.length; ++i) {
        const coin = coins[i]
        const coinBytes = utils.inputBytes(coin) // input bytes
        const coinFee = feeRate * coinBytes // fee of input bytes
        const coinValue = utils.uintOrNaN(coin.amount) // utxo amount

        // skip detrimental input
        if (coinFee > coin.amount) {
            if (i === coins.length - 1) {
                return { fee: feeRate * (bytesAccum + coinBytes) }
            }
            continue
        }

        bytesAccum += coinBytes
        inAccum += coinValue
        inputs.push(coin)

        const fee = feeRate * bytesAccum

        // When the sum is still less than the target, skip
        if (inAccum < outAccum + fee) continue

        return utils.finalize(inputs, outputs, feeRate)
    }

    return {}
}
