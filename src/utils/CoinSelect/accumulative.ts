import { Coin, CoinReturn, FeeRate } from './types'
import utils from './utils'

export default function accumulative<T extends Coin, O extends Coin>(
    coins: T[],
    outputs: O[],
    feeRate: FeeRate = 0n
): CoinReturn<T, O> {
    if (utils.uintOrNaN(feeRate)) return {}

    let bytesAccum = 0n // 計算byte總和
    let inAccum = 0n
    const inputs: T[] = []
    const outAccum = utils.sumOrNaN(outputs)
    for (let i = 0; i < coins.length; ++i) {
        const coin = coins[i]
        const coinBytes = utils.inputBytes(coin) // 輸入的bytes
        const coinFee = feeRate * coinBytes // 輸入的bytes計算fee
        const coinValue = utils.uintOrNaN(coin.amount) // utxo的價格

        // skip detrimental input 跳過有害輸入
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

        // 當加總完畢還是小於目標 跳過
        if (inAccum < outAccum + fee) continue

        return utils.finalize(inputs, outputs, feeRate)
    }

    return {}
}
