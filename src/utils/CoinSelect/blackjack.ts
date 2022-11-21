import { Coin, CoinReturn, FeeRate } from './types'
import utils from './utils'

export default function blackjack<T extends Coin, O extends Coin>(
    coins: T[],
    outputs: O[],
    feeRate: FeeRate = 0
): CoinReturn<T, O> {
    if (!isFinite(utils.uintOrNaN(feeRate))) return {}

    let bytesAccum = 0 // 計算byte總和
    const outAccum = utils.sumOrNaN(outputs) // 輸出的加總
    const threshold = 0 // utils.dustThreshold({}, feeRate)
    let inAccum = 0 // 輸入的加總
    const inputs: T[] = [] // 要輸入的coin
    for (let i = 0; i < coins.length; ++i) {
        const input: T = coins[i]
        const inputBytes = utils.inputBytes(input)
        const fee = feeRate * (bytesAccum + inputBytes)
        const inputValue = utils.uintOrNaN(input.amount)

        // would it waste value? 當輸入大於輸出的時候跳過
        if (inAccum + inputValue > outAccum + fee + threshold) continue

        bytesAccum += inputBytes
        inAccum += inputValue
        inputs.push(input)

        // 當加總完畢還是小於目標 跳過
        if (inAccum < outAccum + fee) continue

        // 當加總完畢還是大於目標 return final
        return utils.finalize<T, O>(inputs, outputs, feeRate)
    }

    return {}
}
