import { Coin, CoinReturn } from './types'

const TX_EMPTY_SIZE = 4n + 1n + 1n + 4n
const TX_INPUT_BASE = 32n + 4n + 1n + 4n
const TX_INPUT_PUBKEYHASH = 107n
const TX_OUTPUT_BASE = 8n + 1n
const TX_OUTPUT_PUBKEYHASH = 25n

function uintOrNaN(v: any): bigint {
    if (typeof v !== 'bigint') return 0n
    if (!isFinite(Number(v))) return 0n
    if (Math.floor(Number(v)) !== Number(v)) return 0n
    if (v < 0) return 0n
    return v
}

// 計算輸入的位元數
function inputBytes(input: Coin): bigint {
    return BigInt(
        TX_INPUT_BASE +
            (input?.puzzle_hash
                ? BigInt(input.puzzle_hash.length)
                : TX_INPUT_PUBKEYHASH)
    )
}

function outputBytes(output: Coin): bigint {
    return BigInt(
        TX_OUTPUT_BASE +
            (output?.puzzle_hash
                ? BigInt(output?.puzzle_hash.length)
                : TX_OUTPUT_PUBKEYHASH)
    )
}

function sumOrNaN(range: Coin[]) {
    return range.reduce(function (a: bigint, x: Coin) {
        return a + uintOrNaN(x?.amount)
    }, 0n)
}

function dustThreshold(output, feeRate) {
    /* ... classify the output for input estimate  */
    return 0n
}

function transactionBytes(inputs: Coin[], outputs: Coin[]) {
    return (
        TX_EMPTY_SIZE +
        inputs.reduce(function (a: bigint, x) {
            return a + inputBytes(x)
        }, 0n) +
        outputs.reduce(function (a: bigint, x) {
            return a + outputBytes(x)
        }, 0n)
    )
}

function finalize<T extends Coin, O extends Coin>(
    inputs: T[],
    outputs: O[],
    feeRate: bigint = 0n
): CoinReturn<T, O> {
    const bytesAccum = 0n
    const feeAfterExtraOutput = feeRate * (bytesAccum + TX_OUTPUT_BASE)
    const remainderAfterExtraOutput =
        sumOrNaN(inputs) - (sumOrNaN(outputs) + feeAfterExtraOutput)

    // is it worth a change output?
    if (remainderAfterExtraOutput > dustThreshold({}, feeRate)) {
        outputs = outputs.concat({
            amount: remainderAfterExtraOutput || 0,
        } as unknown as O)
    }
    const fee = sumOrNaN(inputs) - sumOrNaN(outputs)
    if (fee) return { fee: feeRate * bytesAccum }
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
