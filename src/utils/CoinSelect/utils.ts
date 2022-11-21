import { Coin, CoinReturn } from './types'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
const TX_INPUT_BASE = 32 + 4 + 1 + 4
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1
const TX_OUTPUT_PUBKEYHASH = 25

function uintOrNaN(v: any) {
    if (typeof v !== 'number') return NaN
    if (!isFinite(v)) return NaN
    if (Math.floor(v) !== v) return NaN
    if (v < 0) return NaN
    return v
}

// 計算輸入的位元數
function inputBytes(input: Coin): number {
    return (
        TX_INPUT_BASE +
        (input?.puzzle_hash ? input.puzzle_hash.length : TX_INPUT_PUBKEYHASH)
    )
}
function outputBytes(output: Coin): number {
    return (
        TX_OUTPUT_BASE +
        (output?.puzzle_hash
            ? output?.puzzle_hash.length
            : TX_OUTPUT_PUBKEYHASH)
    )
}

function sumOrNaN(range: Coin[]) {
    return range.reduce(function (a: number, x: Coin) {
        return a + uintOrNaN(x?.amount)
    }, 0)
}

function dustThreshold(output, feeRate) {
    /* ... classify the output for input estimate  */
    return 0
}

function transactionBytes(inputs: Coin[], outputs: Coin[]) {
    return (
        TX_EMPTY_SIZE +
        inputs.reduce(function (a: number, x) {
            return a + Number(inputBytes(x))
        }, 0) +
        outputs.reduce(function (a: number, x) {
            return a + Number(outputBytes(x))
        }, 0)
    )
}

function finalize<T extends Coin, O extends Coin>(
    inputs: T[],
    outputs: O[],
    feeRate: number = 0
): CoinReturn<T, O> {
    const bytesAccum = 0
    const feeAfterExtraOutput = feeRate * (bytesAccum + TX_OUTPUT_BASE)
    const remainderAfterExtraOutput =
        sumOrNaN(inputs) - (sumOrNaN(outputs) + feeAfterExtraOutput)

    // is it worth a change output?
    if (remainderAfterExtraOutput > dustThreshold({}, feeRate)) {
        outputs = outputs.concat({ amount: remainderAfterExtraOutput } as O)
    }
    const fee = sumOrNaN(inputs) - sumOrNaN(outputs)
    if (!isFinite(fee)) return { fee: feeRate * bytesAccum }
    return {
        coins: inputs,
        outputs,
        fee,
    }
}
export default {
    uintOrNaN,
    sumOrNaN,
    finalize,
    inputBytes,
    outputBytes,
    dustThreshold,
    transactionBytes,
}
